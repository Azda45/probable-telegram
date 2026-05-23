import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import pool from "@/be/db";
import { RowDataPacket } from "mysql2";
import { emitOverlayNotification } from "@/be/realtime/socket-server";
import { apiErrorResponse, methodNotAllowedResponse, rejectCrossOrigin, validationErrorResponse } from "@/be/security/request-security";
import { DonationIdSchema } from "@/shared/validation";

export function GET(req: NextRequest) {
  return methodNotAllowedResponse(["POST"], req);
}

/**
 * POST /api/overlay/replay
 * Re-queue a past donation to show on the overlay again.
 * Sets shown_on_overlay = 0 for REST recovery and emits a websocket replay event.
 */
export async function POST(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const parsedDonationId = DonationIdSchema.safeParse(body.donationId);
    if (!parsedDonationId.success) return validationErrorResponse(req);

    const donationId = parsedDonationId.data;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT d.id, d.donor_name, d.amount, d.message, t.order_id, t.paid_at
       FROM donations d
       JOIN transactions t ON d.id = t.donation_id
       WHERE d.id = ? AND d.user_id = ? AND t.transaction_status IN ('settlement','capture')`,
      [donationId, user.id]
    );

    if (rows.length === 0) {
      return apiErrorResponse(req, { error: "Donasi tidak ditemukan" }, 404);
    }

    // Reset shown_on_overlay so the overlay picks it up again
    await pool.execute(
      `UPDATE donations SET shown_on_overlay = 0 WHERE id = ? AND user_id = ?`,
      [donationId, user.id]
    );

    const donation = rows[0];
    await emitOverlayNotification({
      donationId: donation.id,
      orderId: donation.order_id,
      userId: user.id,
      donorName: donation.donor_name,
      amount: donation.amount,
      message: donation.message,
      paidAt: donation.paid_at ? new Date(donation.paid_at).toISOString() : new Date().toISOString(),
    }, "replay");

    return NextResponse.json({
      message: "Donasi akan ditampilkan ulang di overlay!",
      donation,
    });
  } catch (error: unknown) {
    console.error("Replay overlay error:", error);
    return apiErrorResponse(req, { error: "Gagal replay donasi" }, 500);
  }
}
