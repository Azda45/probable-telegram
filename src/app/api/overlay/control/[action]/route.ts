import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getUserByOverlayToken } from "@/be/services";
import { SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";
import { apiErrorResponse, rejectCrossOrigin } from "@/be/security/request-security";
import {
  emitOverlayPause,
  emitOverlaySkip,
  emitOverlayToggleCensor,
  emitOverlayRefresh,
} from "@/be/realtime/socket-server/emitters";
import { emitOverlayNotification, flushQueuedOverlayNotifications } from "@/be/realtime/socket-server";
import { publishOverlayPauseState, toggleOverlayPaused } from "@/be/overlay-state";
import { addTestNotification } from "@/be/testQueue";

function createTestNotification(userId: string) {
  const id = `TEST-${uuidv4()}`;
  const orderId = `TEST-ORDER-${Date.now()}`;
  const testNames = ["Test"];
  const testMessages = [
    "Petualangan besar seringkali dimulai dari sebuah langkah kecil yang penuh keberanian untuk menghadapi segala tantangan dan rintangan yang mungkin muncul di tengah perjalanan panjang menuju puncak kesuksesan yang sangat dinantikan",
  ];
  
  const randomName = testNames[0];
  const randomMessage = testMessages[0];
  const amounts = [2727, 272727, 272727272];
  const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
  const paidAt = new Date().toISOString();

  return {
    notification: { id, donor_name: randomName, amount: randomAmount, message: randomMessage, paid_at: paidAt, isTest: true },
    payload: { donationId: id, orderId, userId, donorName: randomName, amount: randomAmount, message: randomMessage, paidAt },
  };
}

async function handleAction(req: NextRequest, action: string) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    let token = req.nextUrl.searchParams.get("token");
    if (!token && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      token = body.token;
    }
    
    if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
      return apiErrorResponse(req, { error: "Valid overlay token is required" }, 400);
    }

    const user = await getUserByOverlayToken(token);
    if (!user) {
      return apiErrorResponse(req, { error: "Invalid overlay token" }, 401);
    }
    
    switch (action) {
      case "test": {
        const { notification, payload } = createTestNotification(user.id);
        await addTestNotification(user.id, notification);
        await emitOverlayNotification(payload, "test");
        return NextResponse.json({
          message: "Test notification sent!",
          donation: { id: notification.id, donor_name: notification.donor_name, amount: notification.amount, message: notification.message }
        });
      }
      
      case "pause": {
        const state = await toggleOverlayPaused(user.id);
        const emitted = await emitOverlayPause(user.id, state.paused, state.queuedCount);
        await publishOverlayPauseState(user.id, state);
        if (!state.paused) {
          await flushQueuedOverlayNotifications(user.id);
        }
        return NextResponse.json({
          message: `Overlay for user ${user.id} has been ${state.paused ? "paused" : "resumed"}`,
          paused: state.paused,
          queuedCount: state.queuedCount,
          emitted,
        });
      }
      
      case "skip": {
        const emitted = await emitOverlaySkip(user.id);
        return NextResponse.json({ message: emitted ? "Skip command sent" : "Overlay socket unavailable", emitted });
      }
      
      case "censor": {
        const isCensored = await emitOverlayToggleCensor(user.id);
        return NextResponse.json({ message: isCensored ? "Censor activated" : "Censor deactivated", isCensored });
      }
      
      case "refresh": {
        const emitted = await emitOverlayRefresh(user.id);
        return NextResponse.json({ message: emitted ? "Refresh command sent" : "Overlay socket unavailable", emitted });
      }
      
      default:
        return apiErrorResponse(req, { error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error(`Overlay control error:`, error);
    return apiErrorResponse(req, { error: "Action failed" }, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  return handleAction(req, action);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  return handleAction(req, action);
}
