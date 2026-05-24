import { useEffect } from "react";
import type { OverlayNotification } from "@/shared/types/models";
import { createRealtimeSocket, type RealtimeClientSocket } from "@/shared/realtime/socket-client";
import {
  REALTIME_EVENTS,
  type OverlaySettingsUpdatedPayload,
  type OverlayStatePayload,
  type PublicDonationPayload,
  type RealtimeEvent,
} from "@/shared/realtime/events";
import type { IncomingOverlaySettings } from "../types";

interface UseOverlayRealtimeArgs {
  applyOverlaySettings: (settings: IncomingOverlaySettings | null | undefined) => void;
  enqueueNotification: (notif: OverlayNotification, forceReplay?: boolean) => void;
  handlePendingNotification: (notif: OverlayNotification) => void;
  isFrozenRef: React.MutableRefObject<boolean>;
  setIsFrozen: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  setIsCensored: (value: boolean) => void;
  skipActiveNotification: () => void;
  socketRef: React.MutableRefObject<RealtimeClientSocket | null>;
  syncServerQueuedCount: (serverQueuedCount: number, paused: boolean) => void;
  token: string | null;
}

function toNotification(payload: PublicDonationPayload): OverlayNotification {
  return {
    id: payload.donationId,
    donor_name: payload.donorName,
    amount: payload.amount,
    message: payload.message,
  };
}

export default function useOverlayRealtime({
  applyOverlaySettings,
  enqueueNotification,
  handlePendingNotification,
  isFrozenRef,
  setIsFrozen,
  setIsPaused,
  setIsCensored,
  skipActiveNotification,
  socketRef,
  syncServerQueuedCount,
  token,
}: UseOverlayRealtimeArgs) {
  useEffect(() => {
    if (!token) return;

    let disposed = false;
    let socket: RealtimeClientSocket | null = null;

    const handleNotification = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_NOTIFICATION>;
      if (realtimeEvent?.payload) enqueueNotification(toNotification(realtimeEvent.payload));
    };

    const handleReplay = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_REPLAY>;
      if (realtimeEvent?.payload) enqueueNotification(toNotification(realtimeEvent.payload), true);
    };

    const handleTest = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_TEST>;
      if (realtimeEvent?.payload) enqueueNotification(toNotification(realtimeEvent.payload), true);
    };

    const handleOverlayState = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_STATE>;
      const payload = realtimeEvent?.payload as OverlayStatePayload | undefined;
      if (!payload) return;

      applyOverlaySettings(payload.settings);
      isFrozenRef.current = payload.paused;
      setIsPaused(payload.paused);
      setIsFrozen(payload.paused);
      setIsCensored(payload.isCensored);
      syncServerQueuedCount(payload.queuedCount, payload.paused);
      for (const notification of payload.notifications) handlePendingNotification(toNotification(notification));
    };

    const handleSettingsUpdated = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED>;
      const payload = realtimeEvent?.payload as OverlaySettingsUpdatedPayload | undefined;
      if (payload?.settings) applyOverlaySettings(payload.settings);
    };

    const handlePause = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_PAUSE>;
      if (!realtimeEvent?.payload) return;
      const paused = realtimeEvent.payload.paused;
      isFrozenRef.current = paused;
      setIsPaused(paused);
      setIsFrozen(paused);
      syncServerQueuedCount(realtimeEvent.payload.queuedCount, paused);
    };

    const handleRefresh = () => {
      window.location.reload();
    };

    const handleToggleCensor = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_TOGGLE_CENSOR>;
      if (realtimeEvent?.payload) {
        setIsCensored(realtimeEvent.payload.isCensored);
      }
    };

    createRealtimeSocket()
      .then((client) => {
        if (disposed) {
          client.disconnect();
          return;
        }

        socket = client;
        socketRef.current = client;
        client.on("connect", () => client.emit("overlay:join", { token }));
        client.on(REALTIME_EVENTS.OVERLAY_NOTIFICATION, handleNotification);
        client.on(REALTIME_EVENTS.OVERLAY_STATE, handleOverlayState);
        client.on(REALTIME_EVENTS.OVERLAY_REPLAY, handleReplay);
        client.on(REALTIME_EVENTS.OVERLAY_TEST, handleTest);
        client.on(REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED, handleSettingsUpdated);
        client.on(REALTIME_EVENTS.OVERLAY_PAUSE, handlePause);
        client.on(REALTIME_EVENTS.OVERLAY_SKIP, skipActiveNotification);
        client.on(REALTIME_EVENTS.OVERLAY_TOGGLE_CENSOR, handleToggleCensor);
        client.on(REALTIME_EVENTS.OVERLAY_REFRESH, handleRefresh);
        if (client.connected) client.emit("overlay:join", { token });
      })
      .catch((error) => {
        console.warn("Realtime overlay connection unavailable:", error);
      });

    return () => {
      disposed = true;
      if (socket) {
        socket.off(REALTIME_EVENTS.OVERLAY_NOTIFICATION, handleNotification);
        socket.off(REALTIME_EVENTS.OVERLAY_STATE, handleOverlayState);
        socket.off(REALTIME_EVENTS.OVERLAY_REPLAY, handleReplay);
        socket.off(REALTIME_EVENTS.OVERLAY_TEST, handleTest);
        socket.off(REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED, handleSettingsUpdated);
        socket.off(REALTIME_EVENTS.OVERLAY_PAUSE, handlePause);
        socket.off(REALTIME_EVENTS.OVERLAY_SKIP, skipActiveNotification);
        socket.off(REALTIME_EVENTS.OVERLAY_TOGGLE_CENSOR, handleToggleCensor);
        socket.off(REALTIME_EVENTS.OVERLAY_REFRESH, handleRefresh);
        socket.disconnect();
      }
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [
    token,
    applyOverlaySettings,
    enqueueNotification,
    handlePendingNotification,
    skipActiveNotification,
    syncServerQueuedCount,
    isFrozenRef,
    setIsFrozen,
    setIsPaused,
    setIsCensored,
    socketRef,
  ]);
}
