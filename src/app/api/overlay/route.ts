import { NextRequest, NextResponse } from "next/server";
import { getOverlaySettingsByToken } from "@/be/services";
import pool from "@/be/db";
import { RowDataPacket } from "mysql2";
import { getTestNotifications } from "@/be/testQueue";
import { apiErrorResponse, validationErrorResponse } from "@/be/security/request-security";
import { StatusTokenSchema } from "@/shared/validation";
import { z } from "zod";

const OverlayDonationIdSchema = z.string().max(64).regex(/^(TEST-)?[0-9a-fA-F-]{36}$/);

type PendingOverlayNotification = {
  id: string;
  donor_name: string;
  amount: number;
  message: string | null;
};

function normalizeNotification(source: Record<string, unknown>): PendingOverlayNotification {
  return {
    id: String(source.id),
    donor_name: String(source.donor_name || "Anonim"),
    amount: Number(source.amount),
    message: source.message ? String(source.message) : null,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return apiErrorResponse(req, { error: "Token required" }, 400);
  }
  if (!StatusTokenSchema.safeParse(token).success) return validationErrorResponse(req);

  const overlay = await getOverlaySettingsByToken(token);
  if (!overlay) {
    return apiErrorResponse(req, { error: "Invalid token" }, 401);
  }
  const { user, settings } = overlay;

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

  // Get test donations from Redis fallback queue
  const testNotifs = await getTestNotifications(user.id);

  const notifications = [...testNotifs, ...rows].map((notification) =>
    normalizeNotification(notification as Record<string, unknown>)
  );

  return NextResponse.json({
    notifications,
    settings,
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return apiErrorResponse(req, { error: "Token required" }, 400);
  }
  if (!StatusTokenSchema.safeParse(token).success) return validationErrorResponse(req);

  const overlay = await getOverlaySettingsByToken(token);
  if (!overlay) {
    return apiErrorResponse(req, { error: "Invalid token" }, 401);
  }
  const { user } = overlay;

  const { donationId } = await req.json();
  const parsedDonationId = OverlayDonationIdSchema.safeParse(donationId);
  if (!parsedDonationId.success) return validationErrorResponse(req);

  // Mark as shown only if it's a real donation ID (not a TEST uuid that isn't in DB, though it wouldn't match anyway)
  // But to be safe and avoid unnecessary DB hit for test notifs:
  if (!parsedDonationId.data.includes("TEST-")) {
    await pool.execute(
      `UPDATE donations SET shown_on_overlay = 1 WHERE id = ? AND user_id = ?`,
      [parsedDonationId.data, user.id]
    );
  }

  return NextResponse.json({ status: "ok" });
}
