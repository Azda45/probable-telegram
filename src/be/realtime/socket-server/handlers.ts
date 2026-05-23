import type { Socket } from "socket.io";
import pool from "@/be/db";
import { SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";
import { getDonationByOrderIdForStatus, getUserByOverlayToken } from "@/be/services";
import { createRealtimeEnvelope, REALTIME_EVENTS, REALTIME_ROOMS } from "@/shared/realtime/events";
import { HEARTBEAT_INTERVAL_MS, ORDER_ID_PATTERN } from "./constants";
import { deliverNextQueuedOverlayNotification, emitOverlayStateToSocket } from "./overlay-delivery";

function emitSocketError(socket: Socket, code: string, message: string, recoverable: boolean, eventId: string) {
  socket.emit(
    REALTIME_EVENTS.ERROR,
    createRealtimeEnvelope(REALTIME_EVENTS.ERROR, { code, message, recoverable }, `error:${socket.id}:${eventId}`)
  );
}

export function registerSocketHandlers(socket: Socket) {
  socket.emit(
    REALTIME_EVENTS.CONNECTION_READY,
    createRealtimeEnvelope(
      REALTIME_EVENTS.CONNECTION_READY,
      { socketId: socket.id, heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS },
      `connection:${socket.id}`
    )
  );

  socket.on("overlay:join", async ({ token }: { token?: string } = {}) => {
    if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
      emitSocketError(socket, "TOKEN_REQUIRED", "Overlay token is required", false, "token-required");
      return;
    }

    try {
      const user = await getUserByOverlayToken(token);
      if (!user) {
        emitSocketError(socket, "INVALID_TOKEN", "Overlay token is invalid", false, "invalid-token");
        return;
      }

      await socket.join(REALTIME_ROOMS.overlay(user.id));
      socket.data.overlayUserId = user.id;
      await emitOverlayStateToSocket(socket, user);
    } catch (error) {
      console.error("[realtime] overlay join failed", error);
      emitSocketError(socket, "JOIN_FAILED", "Failed to join overlay room", true, "overlay-join-failed");
    }
  });

  socket.on("payment:join", async ({ orderId, statusToken }: { orderId?: string; statusToken?: string } = {}) => {
    if (!orderId || !ORDER_ID_PATTERN.test(orderId) || !statusToken || !SESSION_TOKEN_PATTERN.test(statusToken)) {
      emitSocketError(socket, "ORDER_REQUIRED", "Order ID and status token are required", false, "order-required");
      return;
    }

    try {
      const donation = await getDonationByOrderIdForStatus(orderId, statusToken);
      if (!donation) {
        emitSocketError(socket, "ORDER_NOT_FOUND", "Order was not found", false, "order-not-found");
        return;
      }

      await socket.join(REALTIME_ROOMS.order(orderId));
    } catch (error) {
      console.error("[realtime] payment join failed", error);
      emitSocketError(socket, "JOIN_FAILED", "Failed to join payment room", true, "payment-join-failed");
    }
  });

  socket.on(REALTIME_EVENTS.HEARTBEAT_PONG, () => {
    socket.data.lastPongAt = Date.now();
  });

  socket.on(REALTIME_EVENTS.OVERLAY_ACK, async ({ donationId }: { donationId?: string } = {}) => {
    const userId = socket.data.overlayUserId as string | undefined;
    if (!userId || !donationId) return;

    try {
      if (!donationId.includes("TEST-")) {
        await pool.execute(`UPDATE donations SET shown_on_overlay = 1 WHERE id = ? AND user_id = ?`, [donationId, userId]);
      }
      await deliverNextQueuedOverlayNotification(userId, { completedCurrentNotification: true });
    } catch (error) {
      console.error("[realtime] overlay ack failed", error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[realtime] disconnected socket=${socket.id} reason=${reason}`);
  });
}
