import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as SocketIOServer } from "socket.io";
import { createRedisDuplicate } from "@/be/redis";
import {
  OVERLAY_NOTIFICATION_CHANNEL,
  OVERLAY_PAUSE_CHANNEL,
  type OverlayNotificationEvent,
  type OverlayPauseEvent,
} from "@/be/overlay-state";
import { createRealtimeEnvelope, REALTIME_EVENTS, REALTIME_ROOMS } from "@/shared/realtime/events";
import { emitOverlayNotification } from "./overlay-delivery";
import { globalForRealtime } from "./state";

export async function configureRedisAdapter(io: SocketIOServer) {
  if (globalForRealtime.realtimeRedisAdapter) {
    io.adapter(createAdapter(globalForRealtime.realtimeRedisAdapter.pubClient, globalForRealtime.realtimeRedisAdapter.subClient));
    return;
  }

  if (!globalForRealtime.realtimeRedisAdapterReady) {
    globalForRealtime.realtimeRedisAdapterReady = Promise.all([createRedisDuplicate(), createRedisDuplicate()])
      .then(([pubClient, subClient]) => {
        globalForRealtime.realtimeRedisAdapter = { pubClient, subClient };
        io.adapter(createAdapter(pubClient, subClient));
        console.log("[realtime] socket.io redis adapter initialized");
      })
      .catch((error) => {
        globalForRealtime.realtimeRedisAdapterReady = undefined;
        throw error;
      });
  }

  await globalForRealtime.realtimeRedisAdapterReady;
}

export async function configurePauseSubscriber(io: SocketIOServer) {
  if (globalForRealtime.realtimePauseSubscriber) return;

  if (!globalForRealtime.realtimePauseSubscriberReady) {
    globalForRealtime.realtimePauseSubscriberReady = createRedisDuplicate()
      .then(async (subscriber) => {
        globalForRealtime.realtimePauseSubscriber = subscriber;
        await subscriber.subscribe(OVERLAY_PAUSE_CHANNEL, (message) => {
          try {
            const event = JSON.parse(message) as OverlayPauseEvent;
            io.to(REALTIME_ROOMS.overlay(event.userId)).emit(
              REALTIME_EVENTS.OVERLAY_PAUSE,
              createRealtimeEnvelope(
                REALTIME_EVENTS.OVERLAY_PAUSE,
                { paused: event.paused, queuedCount: event.queuedCount },
                `${REALTIME_EVENTS.OVERLAY_PAUSE}:${event.userId}:${Date.now()}`
              )
            );
          } catch (error) {
            console.warn("[realtime] invalid overlay pause pubsub event", error);
          }
        });
        await subscriber.subscribe(OVERLAY_NOTIFICATION_CHANNEL, (message) => {
          try {
            const event = JSON.parse(message) as OverlayNotificationEvent;
            emitOverlayNotification(event.payload, event.eventKind).catch((error) => {
              console.warn("[realtime] overlay notification pubsub emit failed", error);
            });
          } catch (error) {
            console.warn("[realtime] invalid overlay notification pubsub event", error);
          }
        });
        console.log("[realtime] redis overlay event subscriber initialized");
      })
      .catch((error) => {
        globalForRealtime.realtimePauseSubscriberReady = undefined;
        throw error;
      });
  }

  await globalForRealtime.realtimePauseSubscriberReady;
}
