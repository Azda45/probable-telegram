import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as SocketIOServer } from "socket.io";
import { createRedisDuplicate } from "@/be/redis";
import {
  OVERLAY_NOTIFICATION_CHANNEL,
  OVERLAY_PAUSE_CHANNEL,
  OVERLAY_SETTINGS_UPDATED_CHANNEL,
  OVERLAY_SKIP_CHANNEL,
  OVERLAY_TOGGLE_CENSOR_CHANNEL,
  OVERLAY_REFRESH_CHANNEL,
  type OverlayNotificationEvent,
  type OverlayPauseEvent,
  type OverlaySettingsUpdatedEvent,
  type OverlaySkipEvent,
  type OverlayToggleCensorEvent,
  type OverlayRefreshEvent,
} from "@/be/overlay-state";
import { createRealtimeEnvelope, REALTIME_EVENTS, REALTIME_ROOMS } from "@/shared/realtime/events";
import { emitOverlayNotification, toOverlaySettingsPayload } from "./overlay-delivery";
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
        await subscriber.subscribe(OVERLAY_SETTINGS_UPDATED_CHANNEL, (message) => {
          try {
            const event = JSON.parse(message) as OverlaySettingsUpdatedEvent;
            const settingsPayload = event.settings ? toOverlaySettingsPayload(event.settings) : undefined;
            io.to(REALTIME_ROOMS.overlay(event.userId)).emit(
              REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED,
              createRealtimeEnvelope(
                REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED,
                { userId: event.userId, settings: settingsPayload },
                `${REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED}:${event.userId}:${Date.now()}`
              )
            );
          } catch (error) {
            console.warn("[realtime] invalid settings update pubsub event", error);
          }
        });
        await subscriber.subscribe(OVERLAY_SKIP_CHANNEL, (message) => {
          try {
            const event = JSON.parse(message) as OverlaySkipEvent;
            io.to(REALTIME_ROOMS.overlay(event.userId)).emit(
              REALTIME_EVENTS.OVERLAY_SKIP,
              createRealtimeEnvelope(
                REALTIME_EVENTS.OVERLAY_SKIP,
                { userId: event.userId },
                `${REALTIME_EVENTS.OVERLAY_SKIP}:${event.userId}:${Date.now()}`
              )
            );
          } catch (error) {
            console.warn("[realtime] invalid overlay skip pubsub event", error);
          }
        });
        await subscriber.subscribe(OVERLAY_TOGGLE_CENSOR_CHANNEL, (message) => {
          try {
            const event = JSON.parse(message) as OverlayToggleCensorEvent;
            io.to(REALTIME_ROOMS.overlay(event.userId)).emit(
              REALTIME_EVENTS.OVERLAY_TOGGLE_CENSOR,
              createRealtimeEnvelope(
                REALTIME_EVENTS.OVERLAY_TOGGLE_CENSOR,
                { userId: event.userId, isCensored: event.isCensored },
                `${REALTIME_EVENTS.OVERLAY_TOGGLE_CENSOR}:${event.userId}:${Date.now()}`
              )
            );
          } catch (error) {
            console.warn("[realtime] invalid overlay toggle censor pubsub event", error);
          }
        });
        await subscriber.subscribe(OVERLAY_REFRESH_CHANNEL, (message) => {
          try {
            const event = JSON.parse(message) as OverlayRefreshEvent;
            io.to(REALTIME_ROOMS.overlay(event.userId)).emit(
              REALTIME_EVENTS.OVERLAY_REFRESH,
              createRealtimeEnvelope(
                REALTIME_EVENTS.OVERLAY_REFRESH,
                { userId: event.userId },
                `${REALTIME_EVENTS.OVERLAY_REFRESH}:${event.userId}:${Date.now()}`
              )
            );
          } catch (error) {
            console.warn("[realtime] invalid overlay refresh pubsub event", error);
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

/**
 * Returns a promise that resolves once the Redis PubSub subscriber is fully
 * subscribed to all overlay channels. Socket handlers that depend on the
 * subscriber being active (e.g. `overlay:join`) should await this before
 * sending initial state to prevent the client from missing events published
 * between connection and subscription.
 *
 * Resolves immediately (with void) if no subscriber setup is in progress.
 */
export function waitForSubscriberReady(): Promise<void> {
  return globalForRealtime.realtimePauseSubscriberReady ?? Promise.resolve();
}
