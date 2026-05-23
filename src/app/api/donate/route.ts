import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import {
  createDonation,
  createDonationStatusToken,
  getUserByUsername,
  hashDonationStatusToken,
} from "@/be/services";
import { createQrisCharge } from "@/be/midtrans";
import { publishMessage, QUEUES } from "@/be/rabbitmq";
import { checkRateLimit } from "@/be/rate-limit";
import { apiErrorResponse, getClientIp, methodNotAllowedResponse, validationErrorResponse } from "@/be/security/request-security";
import { DonationCreateSchema } from "@/shared/validation";

export function GET(req: NextRequest) {
  return methodNotAllowedResponse(["POST"], req);
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    if (!(await checkRateLimit(`donate:${clientIp}`, 20, 60 * 60 * 1000))) {
      return NextResponse.json({ error: "Terlalu banyak percobaan donasi" }, { status: 429 });
    }

    const parsed = DonationCreateSchema.safeParse(await req.json());
    if (!parsed.success) return validationErrorResponse(req);

    const {
      username,
      donorName: donorNameClean,
      donorEmail: donorEmailClean,
      amount,
      message: messageClean,
    } = parsed.data;

    // ── Cari streamer ──
    const user = await getUserByUsername(username);
    if (!user) {
      return apiErrorResponse(req, { error: "User tidak ditemukan" }, 404);
    }

    // ── Validasi min & max amount sesuai setting streamer ──
    const minAmount = user.min_amount || 1000;
    const maxAmount = user.max_amount || 10000000;
    if (amount < minAmount) {
      return apiErrorResponse(req, { error: `Minimal donasi ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(minAmount)}` }, 400);
    }
    if (amount > maxAmount) {
      return apiErrorResponse(req, { error: `Maksimal donasi ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(maxAmount)}` }, 400);
    }

    // ── Generate order ID ──
    const orderId = `DON-${nanoid(16)}`;
    const statusToken = createDonationStatusToken();

    // ── Buat Midtrans charge ──
    const charge = await createQrisCharge(orderId, amount, donorNameClean);

    // Extract pure QRIS image URL. QRIS does not need an app-specific deeplink.
    const qrUrl = charge.actions?.find((a) => a.name === "generate-qr-code")?.url || null;
    if (!qrUrl) {
      throw new Error("Midtrans tidak mengembalikan URL QRIS");
    }

    // ── Simpan donasi ke database ──
    const donation = await createDonation({
      userId: user.id,
      orderId,
      statusTokenHash: hashDonationStatusToken(statusToken),
      donorName: donorNameClean,
      donorEmail: donorEmailClean,
      amount,
      message: messageClean,
      qrUrl,
      transactionId: charge.transaction_id,
    });

    // Publish to RabbitMQ
    try {
      await publishMessage(QUEUES.DONATION_CREATED, {
        donationId: donation.id,
        orderId,
        userId: user.id,
        donorName: donorNameClean,
        amount,
        message: messageClean,
        createdAt: new Date().toISOString(),
      });
    } catch (mqError) {
      console.warn("RabbitMQ publish failed (non-critical):", mqError);
    }

    return NextResponse.json({
      donation: {
        id: donation.id,
        orderId,
        statusToken,
        amount,
        qrUrl,
        deeplinkUrl: null,
        transactionId: charge.transaction_id,
      },
      message: "Silakan scan QR code untuk membayar",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Donate error:", err);
    return apiErrorResponse(req, { error: "Gagal membuat donasi" }, 500);
  }
}
