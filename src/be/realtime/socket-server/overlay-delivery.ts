import type { Socket } from "socket.io";
import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { getOverlaySettingsByUserId, type OverlayOwner } from "@/be/services";
import { getTestNotifications } from "@/be/testQueue";
import {
  clearOverlayBusy,
  dequeueOneOverlayNotification,
  enqueueOverlayNotification,
  getOverlayPauseState,
  isOverlayBusy,
  setOverlayBusy,
  type OverlayPauseState,
} from "@/be/overlay-state";
import {
  createRealtimeEnvelope,
  REALTIME_EVENTS,
  REALTIME_ROOMS,
  type OverlaySettingsPayload,
  type PublicDonationPayload,
} from "@/shared/realtime/events";
import { getSocketServer } from "./state";

export function toOverlaySettingsPayload(settings: OverlaySettingsPayload): OverlaySettingsPayload {
  return { ...settings, overlay_animation_enabled: Boolean(settings.overlay_animation_enabled) };
}

async function getPendingOverlayNotifications(userId: string): Promise<PublicDonationPayload[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.id, d.donor_name, d.amount, d.message, t.order_id, t.paid_at
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE d.user_id = ? AND t.transaction_status IN ('settlement','capture') AND d.shown_on_overlay = 0
     ORDER BY t.paid_at ASC
     LIMIT 5`,
    [userId]
  );

  const testNotifications = (await getTestNotifications(userId)).map((notification) => ({
    donationId: notification.id,
    orderId: `TEST-${notification.id}`,
    userId,
    donorName: notification.donor_name,
    amount: Number(notification.amount),
    message: notification.message,
    paidAt: notification.paid_at,
  }));

  const databaseNotifications = rows.map((row) => ({
    donationId: String(row.id),
    orderId: String(row.order_id),
    userId,
    donorName: String(row.donor_name || "Anonim"),
    amount: Number(row.amount),
    message: row.message ? String(row.message) : null,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : new Date().toISOString(),
  }));

  return [...testNotifications, ...databaseNotifications];
}

export async function emitOverlayStateToSocket(socket: Socket, user: OverlayOwner) {
  const settings = await getOverlaySettingsByUserId(user.id);
  const pauseState = await getOverlayPauseState(user.id);
  const notifications = pauseState.paused ? [] : await getPendingOverlayNotifications(user.id);

  socket.emit(
    REALTIME_EVENTS.OVERLAY_STATE,
    createRealtimeEnvelope(
      REALTIME_EVENTS.OVERLAY_STATE,
      { userId: user.id, settings: toOverlaySettingsPayload(settings), notifications, paused: pauseState.paused, queuedCount: pauseState.queuedCount },
      `${REALTIME_EVENTS.OVERLAY_STATE}:${user.id}:${Date.now()}`
    )
  );
}

export function emitOverlayPauseState(userId: string, state: OverlayPauseState) {
  const io = getSocketServer();
  if (!io) return false;

  io.to(REALTIME_ROOMS.overlay(userId)).emit(
    REALTIME_EVENTS.OVERLAY_PAUSE,
    createRealtimeEnvelope(REALTIME_EVENTS.OVERLAY_PAUSE, state, `${REALTIME_EVENTS.OVERLAY_PAUSE}:${userId}:${Date.now()}`)
  );
  return true;
}

export async function emitOverlayNotification(payload: PublicDonationPayload, eventKind: "notification" | "replay" | "test" = "notification") {
  const io = getSocketServer();
  if (!io) return false;

  const pauseState = await getOverlayPauseState(payload.userId);
  const busy = await isOverlayBusy(payload.userId);
  if (pauseState.paused || busy) {
    const updatedState = await enqueueOverlayNotification(payload, eventKind);
    emitOverlayPauseState(payload.userId, updatedState);
    return true;
  }

  await setOverlayBusy(payload.userId);
  const eventName = eventKind === "replay"
    ? REALTIME_EVENTS.OVERLAY_REPLAY
    : eventKind === "test"
      ? REALTIME_EVENTS.OVERLAY_TEST
      : REALTIME_EVENTS.OVERLAY_NOTIFICATION;

  io.to(REALTIME_ROOMS.overlay(payload.userId)).emit(
    eventName,
    createRealtimeEnvelope(eventName, payload, `${eventName}:${payload.donationId}:${payload.paidAt}`)
  );
  return true;
}

export async function flushQueuedOverlayNotifications(userId: string) {
  if (!getSocketServer()) return 0;
  return (await deliverNextQueuedOverlayNotification(userId)) ? 1 : 0;
}

export async function deliverNextQueuedOverlayNotification(userId: string, options: { completedCurrentNotification?: boolean } = {}) {
  if (options.completedCurrentNotification) await clearOverlayBusy(userId);

  const pauseState = await getOverlayPauseState(userId);
  if (pauseState.paused || await isOverlayBusy(userId)) {
    emitOverlayPauseState(userId, pauseState);
    return false;
  }

  const queuedNotification = await dequeueOneOverlayNotification(userId);
  if (!queuedNotification) {
    emitOverlayPauseState(userId, await getOverlayPauseState(userId));
    return false;
  }

  await setOverlayBusy(userId);
  const io = getSocketServer();
  if (!io) return false;

  const eventName = queuedNotification.eventKind === "replay"
    ? REALTIME_EVENTS.OVERLAY_REPLAY
    : queuedNotification.eventKind === "test"
      ? REALTIME_EVENTS.OVERLAY_TEST
      : REALTIME_EVENTS.OVERLAY_NOTIFICATION;
  const notification = queuedNotification.payload;

  io.to(REALTIME_ROOMS.overlay(userId)).emit(
    eventName,
    createRealtimeEnvelope(eventName, notification, `${eventName}:${notification.donationId}:${notification.paidAt}`)
  );
  emitOverlayPauseState(userId, await getOverlayPauseState(userId));
  return true;
}
