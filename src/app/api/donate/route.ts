import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getUserByUsername, createDonation } from "@/lib/services";
import { createQrisCharge } from "@/lib/midtrans";
import { publishMessage, QUEUES } from "@/lib/rabbitmq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, donorName, donorEmail, amount: rawAmount, message } = body;

    // ── Validasi input wajib ──
    if (!username || !donorName || !donorEmail || rawAmount === undefined) {
      return NextResponse.json(
        { error: "Username, nama donatur, email, dan jumlah wajib diisi" },
        { status: 400 }
      );
    }

    // ── Sanitasi nama (potong tag HTML) ──
    const donorNameClean = String(donorName).trim().replace(/[<>"']/g, "").substring(0, 100);
    if (!donorNameClean) {
      return NextResponse.json({ error: "Nama donatur tidak valid" }, { status: 400 });
    }

    // ── Sanitasi Email ──
    const donorEmailClean = String(donorEmail).trim().toLowerCase();
    if (!donorEmailClean || !donorEmailClean.includes("@")) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    // ── Sanitasi pesan ──
    const messageClean = message
      ? String(message).trim().replace(/[<>]/g, "").substring(0, 500)
      : undefined;

    // ── Validasi amount: harus integer positif ──
    const amount = Math.floor(Number(rawAmount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Jumlah donasi tidak valid" }, { status: 400 });
    }

    // ── Cari streamer ──
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // ── Validasi min & max amount sesuai setting streamer ──
    const minAmount = user.min_amount || 1000;
    const maxAmount = user.max_amount || 10000000;
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimal donasi ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(minAmount)}` },
        { status: 400 }
      );
    }
    if (amount > maxAmount) {
      return NextResponse.json(
        { error: `Maksimal donasi ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(maxAmount)}` },
        { status: 400 }
      );
    }

    // ── Generate order ID ──
    const orderId = `DON-${nanoid(16)}`;

    // ── Buat Midtrans charge ──
    const charge = await createQrisCharge(orderId, amount, donorNameClean);

    // Extract QR URL and deeplink
    const qrUrl = charge.actions?.find((a) => a.name === "generate-qr-code")?.url || null;
    const deeplinkUrl = charge.actions?.find((a) => a.name === "deeplink-redirect")?.url || null;

    // ── Simpan donasi ke database ──
    const donation = await createDonation({
      userId: user.id,
      orderId,
      donorName: donorNameClean,
      donorEmail: donorEmailClean,
      amount,
      message: messageClean,
      qrUrl: qrUrl || undefined,
      deeplinkUrl: deeplinkUrl || undefined,
      transactionId: charge.transaction_id,
    });

    // Publish to RabbitMQ
    try {
      await publishMessage(QUEUES.DONATION_CREATED, {
        donationId: donation.id,
        orderId,
        userId: user.id,
        donorName,
        amount,
        message,
        createdAt: new Date().toISOString(),
      });
    } catch (mqError) {
      console.warn("RabbitMQ publish failed (non-critical):", mqError);
    }

    return NextResponse.json({
      donation: {
        id: donation.id,
        orderId,
        amount,
        qrUrl,
        deeplinkUrl,
        transactionId: charge.transaction_id,
      },
      message: "Silakan scan QR code untuk membayar",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Donate error:", err);
    return NextResponse.json(
      { error: "Gagal membuat donasi", details: err.message },
      { status: 500 }
    );
  }
}
