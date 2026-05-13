import { NextRequest, NextResponse } from "next/server";
import { getUserByOverlayToken } from "@/lib/services";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getTestNotifications } from "@/lib/testQueue";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const user = await getUserByOverlayToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Get unshown real donations
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.id, d.donor_name, d.amount, d.message, t.paid_at 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE d.user_id = ? AND t.transaction_status IN ('settlement','capture') AND d.shown_on_overlay = 0
     ORDER BY t.paid_at ASC
     LIMIT 5`,
    [user.id]
  );

  // Get test donations from memory
  const testNotifs = getTestNotifications(user.id);

  return NextResponse.json({
    notifications: [...testNotifs, ...rows],
    settings: {
      alert_sound: user.alert_sound,
      alert_duration: user.alert_duration,
      tts_enabled: user.tts_enabled,
      tts_voice: user.tts_voice,
    },
  });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const user = await getUserByOverlayToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { donationId } = await req.json();

  // Mark as shown only if it's a real donation ID (not a TEST uuid that isn't in DB, though it wouldn't match anyway)
  // But to be safe and avoid unnecessary DB hit for test notifs:
  if (!donationId.includes("TEST-")) {
    await pool.execute(
      `UPDATE donations SET shown_on_overlay = 1 WHERE id = ? AND user_id = ?`,
      [donationId, user.id]
    );
  }

  return NextResponse.json({ status: "ok" });
}
