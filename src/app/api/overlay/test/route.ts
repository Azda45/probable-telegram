import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { v4 as uuidv4 } from "uuid";
import { addTestNotification } from "@/be/testQueue";
import { emitOverlayNotification } from "@/be/realtime/socket-server";
import { apiErrorResponse, rejectCrossOrigin } from "@/be/security/request-security";
import { publishOverlayNotificationEvent } from "@/be/overlay-state";
import { getUserByOverlayToken } from "@/be/services";
import { SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";

function createTestNotification(userId: string) {
  const id = `TEST-${uuidv4()}`;
  const orderId = `TEST-ORDER-${Date.now()}`;
  const testNames = [
    "Test",
  ];
  const testMessages = [
    "Petualangan besar seringkali dimulai dari sebuah langkah kecil yang penuh keberanian untuk menghadapi segala tantangan dan rintangan yang mungkin muncul di tengah perjalanan panjang menuju puncak kesuksesan yang sangat dinantikan",
  ];

  const randomName = testNames[Math.floor(Math.random() * testNames.length)];
  const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
  const amounts = [2727, 272727, 272727272];
  const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
  const paidAt = new Date().toISOString();

  return {
    notification: {
      id,
      donor_name: randomName,
      amount: randomAmount,
      message: randomMessage,
      paid_at: paidAt,
      isTest: true,
    },
    payload: {
      donationId: id,
      orderId,
      userId,
      donorName: randomName,
      amount: randomAmount,
      message: randomMessage,
      paidAt,
    },
  };
}

/**
 * POST /api/overlay/test
 * Inserts a fake test donation so the overlay picks it up on next poll.
 * Requires authentication (dashboard session).
 */
export async function POST(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const { notification, payload } = createTestNotification(user.id);

    // Keep Redis queue as fallback while websocket clients roll out.
    await addTestNotification(user.id, notification);

    await emitOverlayNotification(payload, "test");

    return NextResponse.json({
      message: "Test notification sent!",
      donation: {
        id: notification.id,
        donor_name: notification.donor_name,
        amount: notification.amount,
        message: notification.message,
      },
    });
  } catch (error: unknown) {
    console.error("Test overlay error:", error);
    return apiErrorResponse(req, { error: "Gagal mengirim test" }, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
      return apiErrorResponse(req, { error: "Valid overlay token is required" }, 400);
    }

    const user = await getUserByOverlayToken(token);
    if (!user) {
      return apiErrorResponse(req, { error: "Invalid overlay token" }, 401);
    }

    const { notification, payload } = createTestNotification(user.id);
    await addTestNotification(user.id, notification);
    await publishOverlayNotificationEvent(payload, "test");

    return NextResponse.json({
      message: "External test notification sent!",
      donation: {
        id: notification.id,
        donor_name: notification.donor_name,
        amount: notification.amount,
        message: notification.message,
      },
    });
  } catch (error: unknown) {
    console.error("External test overlay error:", error);
    return apiErrorResponse(req, { error: "Gagal mengirim test external" }, 500);
  }
}
