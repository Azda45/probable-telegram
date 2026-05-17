import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { emitOverlayNotification } from "@/lib/realtime/socket-server";

/**
 * POST /api/overlay/replay
 * Re-queue a past donation to show on the overlay again.
 * Sets shown_on_overlay = 0 for REST recovery and emits a websocket replay event.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { donationId } = await req.json();
    if (!donationId) {
      return NextResponse.json({ error: "donationId required" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT d.id, d.donor_name, d.amount, d.message, t.order_id, t.paid_at
       FROM donations d
       JOIN transactions t ON d.id = t.donation_id
       WHERE d.id = ? AND d.user_id = ? AND t.transaction_status IN ('settlement','capture')`,
      [donationId, user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
    }

    // Reset shown_on_overlay so the overlay picks it up again
    await pool.execute(
      `UPDATE donations SET shown_on_overlay = 0 WHERE id = ? AND user_id = ?`,
      [donationId, user.id]
    );

    const donation = rows[0];
    emitOverlayNotification({
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
    return NextResponse.json({ error: "Gagal replay donasi" }, { status: 500 });
  }
}
