import { NextRequest, NextResponse } from "next/server";
import { emitOverlayPause, flushQueuedOverlayNotifications } from "@/be/realtime/socket-server";
import { publishOverlayPauseState, toggleOverlayPaused } from "@/be/overlay-state";
import { getUserByOverlayToken } from "@/be/services";
import { SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";
import { apiErrorResponse } from "@/be/security/request-security";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
    return apiErrorResponse(request, { error: "Valid overlay token is required" }, 400);
  }

  const user = await getUserByOverlayToken(token);
  if (!user) {
    return apiErrorResponse(request, { error: "Invalid overlay token" }, 401);
  }

  const userId = user.id;

  const state = await toggleOverlayPaused(userId);
  const publishedState = state;
  const emitted = await emitOverlayPause(userId, publishedState.paused, publishedState.queuedCount);
  await publishOverlayPauseState(userId, publishedState);

  if (!state.paused) {
    await flushQueuedOverlayNotifications(userId);
  }

  return NextResponse.json({
    message: `Overlay for user ${userId} has been ${state.paused ? "paused" : "resumed"}`,
    paused: publishedState.paused,
    queuedCount: publishedState.queuedCount,
    emitted,
  });
}
