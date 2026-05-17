import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import pool from "@/lib/db";
import { getDonationByOrderId, getUserByOverlayToken } from "@/lib/services";
import {
  createRealtimeEnvelope,
  REALTIME_EVENTS,
  REALTIME_ROOMS,
  type PaymentStatusPayload,
  type PublicDonationPayload,
} from "./events";

const HEARTBEAT_INTERVAL_MS = 25_000;
const HEARTBEAT_TIMEOUT_MS = 20_000;

type SocketServer = SocketIOServer | null;

const globalForRealtime = globalThis as unknown as {
  realtimeSocketServer?: SocketIOServer;
};

export function getSocketServer(): SocketServer {
  return globalForRealtime.realtimeSocketServer || null;
}

export function initializeSocketServer(httpServer: HttpServer): SocketIOServer {
  if (globalForRealtime.realtimeSocketServer) {
    return globalForRealtime.realtimeSocketServer;
  }

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingInterval: HEARTBEAT_INTERVAL_MS,
    pingTimeout: HEARTBEAT_TIMEOUT_MS,
    maxHttpBufferSize: 64 * 1024,
    transports: ["websocket"],
  });

  io.on("connection", (socket) => {
    console.log(`[realtime] connected socket=${socket.id}`);

    socket.emit(
      REALTIME_EVENTS.CONNECTION_READY,
      createRealtimeEnvelope(
        REALTIME_EVENTS.CONNECTION_READY,
        { socketId: socket.id, heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS },
        `connection:${socket.id}`
      )
    );

    socket.on("overlay:join", async ({ token }: { token?: string } = {}) => {
      if (!token) {
        socket.emit(REALTIME_EVENTS.ERROR, createRealtimeEnvelope(
          REALTIME_EVENTS.ERROR,
          { code: "TOKEN_REQUIRED", message: "Overlay token is required", recoverable: false },
          `error:${socket.id}:token-required`
        ));
        return;
      }

      try {
        const user = await getUserByOverlayToken(token);
        if (!user) {
          socket.emit(REALTIME_EVENTS.ERROR, createRealtimeEnvelope(
            REALTIME_EVENTS.ERROR,
            { code: "INVALID_TOKEN", message: "Overlay token is invalid", recoverable: false },
            `error:${socket.id}:invalid-token`
          ));
          return;
        }

        await socket.join(REALTIME_ROOMS.overlay(user.id));
        socket.data.overlayUserId = user.id;
        console.log(`[realtime] socket=${socket.id} joined overlay:${user.id}`);
      } catch (error) {
        console.error("[realtime] overlay join failed", error);
        socket.emit(REALTIME_EVENTS.ERROR, createRealtimeEnvelope(
          REALTIME_EVENTS.ERROR,
          { code: "JOIN_FAILED", message: "Failed to join overlay room", recoverable: true },
          `error:${socket.id}:overlay-join-failed`
        ));
      }
    });

    socket.on("payment:join", async ({ orderId }: { orderId?: string } = {}) => {
      if (!orderId) {
        socket.emit(REALTIME_EVENTS.ERROR, createRealtimeEnvelope(
          REALTIME_EVENTS.ERROR,
          { code: "ORDER_REQUIRED", message: "Order ID is required", recoverable: false },
          `error:${socket.id}:order-required`
        ));
        return;
      }

      try {
        const donation = await getDonationByOrderId(orderId);
        if (!donation) {
          socket.emit(REALTIME_EVENTS.ERROR, createRealtimeEnvelope(
            REALTIME_EVENTS.ERROR,
            { code: "ORDER_NOT_FOUND", message: "Order was not found", recoverable: false },
            `error:${socket.id}:order-not-found`
          ));
          return;
        }

        await socket.join(REALTIME_ROOMS.order(orderId));
        console.log(`[realtime] socket=${socket.id} joined order:${orderId}`);
      } catch (error) {
        console.error("[realtime] payment join failed", error);
        socket.emit(REALTIME_EVENTS.ERROR, createRealtimeEnvelope(
          REALTIME_EVENTS.ERROR,
          { code: "JOIN_FAILED", message: "Failed to join payment room", recoverable: true },
          `error:${socket.id}:payment-join-failed`
        ));
      }
    });

    socket.on(REALTIME_EVENTS.HEARTBEAT_PONG, () => {
      socket.data.lastPongAt = Date.now();
    });

    socket.on(REALTIME_EVENTS.OVERLAY_ACK, async ({ donationId }: { donationId?: string } = {}) => {
      const userId = socket.data.overlayUserId as string | undefined;
      if (!userId || !donationId || donationId.includes("TEST-")) return;

      try {
        await pool.execute(
          `UPDATE donations SET shown_on_overlay = 1 WHERE id = ? AND user_id = ?`,
          [donationId, userId]
        );
      } catch (error) {
        console.error("[realtime] overlay ack failed", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[realtime] disconnected socket=${socket.id} reason=${reason}`);
    });
  });

  globalForRealtime.realtimeSocketServer = io;
  console.log("[realtime] socket.io server initialized");
  return io;
}

export function emitOverlayNotification(payload: PublicDonationPayload, eventKind: "notification" | "replay" | "test" = "notification") {
  const io = getSocketServer();
  if (!io) return false;

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
