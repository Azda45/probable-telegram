import type { PublicDonationPayload } from "@/shared/realtime/events";
import { getRedisClient } from "@/be/redis";

const OVERLAY_QUEUE_TTL_SECONDS = 24 * 60 * 60;
const OVERLAY_BUSY_TTL_SECONDS = 10 * 60;
export const OVERLAY_PAUSE_CHANNEL = "overlay:pause:events";
export const OVERLAY_NOTIFICATION_CHANNEL = "overlay:notification:events";

function pauseKey(userId: string) {
  return `overlay:pause:${userId}`;
}

function queueKey(userId: string) {
  return `overlay:queue:${userId}`;
}

function busyKey(userId: string) {
  return `overlay:busy:${userId}`;
}

export interface OverlayPauseState {
  paused: boolean;
  queuedCount: number;
}

export interface OverlayPauseEvent extends OverlayPauseState {
  userId: string;
}

export interface OverlayNotificationEvent {
  eventKind: "notification" | "replay" | "test";
  payload: PublicDonationPayload;
}

export type QueuedOverlayNotification = OverlayNotificationEvent;

function parseQueuedOverlayNotification(raw: string): QueuedOverlayNotification | null {
  try {
    const parsed = JSON.parse(raw) as Partial<QueuedOverlayNotification> & Partial<PublicDonationPayload>;

    if (parsed.payload) {
      return {
        eventKind: parsed.eventKind === "replay" || parsed.eventKind === "test" ? parsed.eventKind : "notification",
        payload: parsed.payload,
      };
    }

    // Backward-compatible read for queue entries created before eventKind was stored.
    return {
      eventKind: "notification",
      payload: parsed as PublicDonationPayload,
    };
  } catch (error) {
    console.warn("[overlay-state] invalid queued notification skipped", error);
    return null;
  }
}

export async function getOverlayPauseState(userId: string): Promise<OverlayPauseState> {
  const redis = await getRedisClient();
  const [paused, queuedCount] = await Promise.all([
    redis.get(pauseKey(userId)),
    redis.lLen(queueKey(userId)),
  ]);

  return {
    paused: paused === "1",
    queuedCount,
  };
}

export async function setOverlayPaused(userId: string, paused: boolean): Promise<OverlayPauseState> {
  const redis = await getRedisClient();
  if (paused) {
    await redis.set(pauseKey(userId), "1");
  } else {
    await redis.del(pauseKey(userId));
  }

  return getOverlayPauseState(userId);
}

export async function toggleOverlayPaused(userId: string): Promise<OverlayPauseState> {
  const current = await getOverlayPauseState(userId);
  return setOverlayPaused(userId, !current.paused);
}

export async function publishOverlayPauseState(userId: string, state: OverlayPauseState) {
  const redis = await getRedisClient();
  const event: OverlayPauseEvent = { userId, ...state };
  await redis.publish(OVERLAY_PAUSE_CHANNEL, JSON.stringify(event));
}

export async function publishOverlayNotificationEvent(
  payload: PublicDonationPayload,
  eventKind: OverlayNotificationEvent["eventKind"] = "notification"
) {
  const redis = await getRedisClient();
  const event: OverlayNotificationEvent = { payload, eventKind };
  await redis.publish(OVERLAY_NOTIFICATION_CHANNEL, JSON.stringify(event));
}

export async function enqueueOverlayNotification(
  payload: PublicDonationPayload,
  eventKind: OverlayNotificationEvent["eventKind"] = "notification"
): Promise<OverlayPauseState> {
  const redis = await getRedisClient();
  const key = queueKey(payload.userId);
  await redis.rPush(key, JSON.stringify({ eventKind, payload } satisfies QueuedOverlayNotification));
  await redis.expire(key, OVERLAY_QUEUE_TTL_SECONDS);
  return getOverlayPauseState(payload.userId);
}

export async function isOverlayBusy(userId: string): Promise<boolean> {
  const redis = await getRedisClient();
  return (await redis.get(busyKey(userId))) === "1";
}

export async function setOverlayBusy(userId: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.set(busyKey(userId), "1", { EX: OVERLAY_BUSY_TTL_SECONDS });
}

export async function clearOverlayBusy(userId: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(busyKey(userId));
}

export async function dequeueOverlayNotifications(userId: string, limit = 100): Promise<QueuedOverlayNotification[]> {
  const redis = await getRedisClient();
  const key = queueKey(userId);
  const notifications: QueuedOverlayNotification[] = [];

  for (let index = 0; index < limit; index += 1) {
    const raw = await redis.lPop(key);
    if (!raw) break;

    const notification = parseQueuedOverlayNotification(raw);
    if (notification) notifications.push(notification);
  }

  return notifications;
}

export async function dequeueOneOverlayNotification(userId: string): Promise<QueuedOverlayNotification | null> {
  const redis = await getRedisClient();
  const raw = await redis.lPop(queueKey(userId));
  if (!raw) return null;

  return parseQueuedOverlayNotification(raw);
}
