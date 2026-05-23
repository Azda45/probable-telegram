import { getOverlayPauseState } from "@/be/overlay-state";
import {
  createRealtimeEnvelope,
  REALTIME_EVENTS,
  REALTIME_ROOMS,
  type OverlaySettingsPayload,
  type PaymentStatusPayload,
} from "@/shared/realtime/events";
import { emitOverlayPauseState, toOverlaySettingsPayload } from "./overlay-delivery";
import { getSocketServer } from "./state";

export function emitPaymentStatus(payload: PaymentStatusPayload) {
  const io = getSocketServer();
  if (!io) return false;

  io.to(REALTIME_ROOMS.order(payload.orderId)).emit(
    REALTIME_EVENTS.PAYMENT_STATUS_CHANGED,
    createRealtimeEnvelope(
      REALTIME_EVENTS.PAYMENT_STATUS_CHANGED,
      payload,
      `${REALTIME_EVENTS.PAYMENT_STATUS_CHANGED}:${payload.orderId}:${payload.status}`
    )
  );
  return true;
}

export function emitOverlaySettingsUpdated(userId: string, settings?: OverlaySettingsPayload) {
  const io = getSocketServer();
  if (!io) return false;

  io.to(REALTIME_ROOMS.overlay(userId)).emit(
    REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED,
    createRealtimeEnvelope(
      REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED,
      { userId, settings: settings ? toOverlaySettingsPayload(settings) : undefined },
      `${REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED}:${userId}:${Date.now()}`
    )
  );
  return true;
}

export async function emitOverlayPause(userId: string, paused: boolean = true, queuedCount?: number) {
  const state = { paused, queuedCount: queuedCount ?? (await getOverlayPauseState(userId)).queuedCount };
  return emitOverlayPauseState(userId, state);
}

export async function emitOverlaySkip(userId: string) {
  const io = getSocketServer();
  if (!io) return false;

  const overlaySockets = await io.in(REALTIME_ROOMS.overlay(userId)).allSockets();
  if (overlaySockets.size === 0) return false;

  io.to(REALTIME_ROOMS.overlay(userId)).emit(
    REALTIME_EVENTS.OVERLAY_SKIP,
    createRealtimeEnvelope(REALTIME_EVENTS.OVERLAY_SKIP, { userId }, `${REALTIME_EVENTS.OVERLAY_SKIP}:${userId}:${Date.now()}`)
  );
  return true;
}
