import { useState, useEffect, useRef, useCallback } from "react";
import {
  destroyAlertAudio,
  playNotificationSound,
  preloadAlertSounds,
  stopAlertSounds,
  unlockAlertAudio,
} from "@/components/NotificationSound";
import type { OverlayNotification } from "@/lib/types";
import { createRealtimeSocket, type RealtimeClientSocket } from "@/lib/realtime/socket-client";
import { REALTIME_EVENTS, type PublicDonationPayload, type RealtimeEvent } from "@/lib/realtime/events";

interface Settings {
  alert_duration: number;
  alert_sound: string;
  overlay_style: string;
}

interface AlertLifecycleState {
  donationId: string;
  startedAt: number;
  durationMs: number;
  audioPlayed: boolean;
  completed: boolean;
  completedAt?: number;
}

interface QueuedNotification {
  notif: OverlayNotification;
  forceReplay: boolean;
}

const ALERT_STATE_PREFIX = "overlay-alert-state";
const COMPLETED_STATE_TTL_MS = 24 * 60 * 60 * 1000;

export function useOverlay(token: string | null) {
  const [current, setCurrent] = useState<OverlayNotification | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [isResumedAlert, setIsResumedAlert] = useState(false);

  const settingsRef = useRef<Settings | null>(null);
  const queueRef = useRef<QueuedNotification[]>([]);
  const showingRef = useRef(false);
  const activeNotifIdRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const socketRef = useRef<RealtimeClientSocket | null>(null);
  const showNotificationRef = useRef<(item: QueuedNotification) => void>(() => {});

  const getAlertStorageKey = useCallback(
    (donationId: string) => `${ALERT_STATE_PREFIX}:${token || "no-token"}:${donationId}`,
    [token]
  );

  const loadAlertState = useCallback(
    (donationId: string): AlertLifecycleState | null => {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.localStorage.getItem(getAlertStorageKey(donationId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AlertLifecycleState;
        if (parsed.completed && parsed.completedAt && Date.now() - parsed.completedAt > COMPLETED_STATE_TTL_MS) {
          window.localStorage.removeItem(getAlertStorageKey(donationId));
          return null;
        }
        return parsed;
      } catch (error) {
        console.warn("[overlay-lifecycle] failed to load alert state", { donationId, error });
        return null;
      }
    },
    [getAlertStorageKey]
  );

  const saveAlertState = useCallback(
    (state: AlertLifecycleState) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(getAlertStorageKey(state.donationId), JSON.stringify(state));
      } catch (error) {
        console.warn("[overlay-lifecycle] failed to save alert state", { donationId: state.donationId, error });
      }
    },
    [getAlertStorageKey]
  );

  const createFreshAlertState = useCallback((notif: OverlayNotification): AlertLifecycleState => {
    const durationMs = (settingsRef.current?.alert_duration || 5) * 1000;
    return {
      donationId: notif.id,
      startedAt: Date.now(),
      durationMs,
      audioPlayed: false,
      completed: false,
    };
  }, []);

  const ackNotification = useCallback(
    (donationId: string) => {
      const completedState = loadAlertState(donationId);
      if (completedState) {
        saveAlertState({ ...completedState, completed: true, completedAt: Date.now() });
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit(REALTIME_EVENTS.OVERLAY_ACK, {
          donationId,
          displayedAt: new Date().toISOString(),
        });
      } else {
        fetch(`/api/overlay?token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ donationId }),
        }).catch(() => {});
      }
    },
    [loadAlertState, saveAlertState, token]
  );

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Preload alert audio once per overlay session and unlock on first interaction.
  useEffect(() => {
    preloadAlertSounds().catch((error) => {
      console.warn("Alert audio preload failed:", error);
    });

    const cleanupListeners = () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    const unlockAudio = () => {
      unlockAlertAudio().finally(cleanupListeners);
    };

    window.addEventListener("click", unlockAudio, { once: false });
    window.addEventListener("touchstart", unlockAudio, { once: false });
    window.addEventListener("keydown", unlockAudio, { once: false });

    return () => {
      cleanupListeners();
      stopAlertSounds();
      destroyAlertAudio();
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = useCallback(
    ({ notif, forceReplay }: QueuedNotification) => {
      clearAllTimers();

      const existingState = forceReplay ? null : loadAlertState(notif.id);
      const lifecycle = existingState || createFreshAlertState(notif);
      const elapsedMs = Math.max(0, Date.now() - lifecycle.startedAt);
      const remainingMs = Math.max(0, lifecycle.durationMs - elapsedMs);

      if (lifecycle.completed || remainingMs <= 0) {
        console.debug("[overlay-lifecycle] recovered alert already expired/completed; ack without replay", {
          donationId: notif.id,
          elapsedMs,
          durationMs: lifecycle.durationMs,
          completed: lifecycle.completed,
        });
        saveAlertState({ ...lifecycle, completed: true, completedAt: Date.now() });
        ackNotification(notif.id);

        if (queueRef.current.length > 0) {
          const next = queueRef.current.shift()!;
          addTimer(() => showNotificationRef.current(next), 0);
        }
        return;
      }

      saveAlertState(lifecycle);

      console.debug("[overlay-audio] showing notification", {
        donationId: notif.id,
        alertSound: settingsRef.current?.alert_sound || "default",
        forceReplay,
        elapsedMs,
        remainingMs,
        audioPlayed: lifecycle.audioPlayed,
      });

      showingRef.current = true;
      activeNotifIdRef.current = notif.id;
      setCurrent(notif);
      setIsResumedAlert(Boolean(existingState && elapsedMs > 0 && !forceReplay));
      setIsShowing(true);

      // Play alert audio only once per lifecycle. Recovered in-progress alerts resume visually without replaying audio.
      if (!lifecycle.audioPlayed && settingsRef.current?.alert_sound !== "none") {
        saveAlertState({ ...lifecycle, audioPlayed: true });
        const soundToPlay = settingsRef.current?.alert_sound;
        addTimer(() => {
          playNotificationSound(soundToPlay).catch((error) => {
            console.warn("[overlay-audio] alert playback failed", error);
          });
        }, 500);
      }

      // Helper: slide out → clear → next
      const hideAndNext = () => {
        if (activeNotifIdRef.current !== notif.id) return;
        setIsShowing(false);

        addTimer(() => {
          if (activeNotifIdRef.current === notif.id) {
            setCurrent(null);
            setIsResumedAlert(false);
            showingRef.current = false;
            activeNotifIdRef.current = null;
          }

          saveAlertState({ ...lifecycle, audioPlayed: true, completed: true, completedAt: Date.now() });
          ackNotification(notif.id);

          if (queueRef.current.length > 0) {
            const next = queueRef.current.shift()!;
            addTimer(() => showNotificationRef.current(next), 3000);
          }
        }, 600);
      };

      addTimer(hideAndNext, remainingMs);
    },
    [ackNotification, addTimer, clearAllTimers, createFreshAlertState, loadAlertState, saveAlertState]
  );

  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  const enqueueNotification = useCallback(
    (notif: OverlayNotification, forceReplay = false) => {
      if (!forceReplay && seenIdsRef.current.has(notif.id)) return;
      seenIdsRef.current.add(notif.id);

      if (typeof notif.amount !== "number" || isNaN(notif.amount) || notif.amount <= 0) {
        ackNotification(notif.id);
        return;
      }

      if (showingRef.current) {
        queueRef.current.push({ notif, forceReplay });
      } else {
        showNotification({ notif, forceReplay });
      }
    },
    [ackNotification, showNotification]
  );

  // Reactive state for settings to ensure re-renders
  const [overlayStyle, setOverlayStyle] = useState<string>("right");

  const fetchPendingNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`/api/overlay?token=${token}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (data.settings) {
        settingsRef.current = data.settings;
        setOverlayStyle(data.settings.overlay_style || "right");
      }

      if (data.notifications && data.notifications.length > 0) {
        for (const notif of data.notifications as OverlayNotification[]) {
          enqueueNotification(notif);
        }
      }
    } catch {
      // One-shot recovery fetch failure is non-fatal; websocket remains primary.
    }
  }, [token, enqueueNotification]);

  // Websocket realtime effect. This is the primary overlay update path.
  useEffect(() => {
    if (!token) return;

    let disposed = false;
    let socket: RealtimeClientSocket | null = null;

    const toNotification = (payload: PublicDonationPayload): OverlayNotification => ({
      id: payload.donationId,
      donor_name: payload.donorName,
      amount: payload.amount,
      message: payload.message,
    });

    const handleNotification = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_NOTIFICATION>;
      if (realtimeEvent?.payload) {
        console.debug("[overlay-audio] websocket notification received", {
          eventId: realtimeEvent.eventId,
          donationId: realtimeEvent.payload.donationId,
        });
        enqueueNotification(toNotification(realtimeEvent.payload));
      }
    };

    const handleReplay = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_REPLAY>;
      if (realtimeEvent?.payload) enqueueNotification(toNotification(realtimeEvent.payload), true);
    };

    const handleTest = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.OVERLAY_TEST>;
      if (realtimeEvent?.payload) enqueueNotification(toNotification(realtimeEvent.payload), true);
    };

    const handleSettingsUpdated = () => {
      console.debug("[overlay-audio] websocket settings updated");
      fetchPendingNotifications();
    };

    createRealtimeSocket()
      .then((client) => {
        if (disposed) {
          client.disconnect();
          return;
        }

        socket = client;
        socketRef.current = client;

        client.on("connect", () => {
          client.emit("overlay:join", { token });
          fetchPendingNotifications();
        });
        client.on(REALTIME_EVENTS.OVERLAY_NOTIFICATION, handleNotification);
        client.on(REALTIME_EVENTS.OVERLAY_REPLAY, handleReplay);
        client.on(REALTIME_EVENTS.OVERLAY_TEST, handleTest);
        client.on(REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED, handleSettingsUpdated);

        if (client.connected) {
          client.emit("overlay:join", { token });
          fetchPendingNotifications();
        }
      })
      .catch((error) => {
        console.warn("Realtime overlay connection unavailable; only one-shot recovery fetch remains:", error);
      });

    return () => {
      disposed = true;
      if (socket) {
        socket.off(REALTIME_EVENTS.OVERLAY_NOTIFICATION, handleNotification);
        socket.off(REALTIME_EVENTS.OVERLAY_REPLAY, handleReplay);
        socket.off(REALTIME_EVENTS.OVERLAY_TEST, handleTest);
        socket.off(REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED, handleSettingsUpdated);
        socket.disconnect();
      }
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [token, enqueueNotification, fetchPendingNotifications]);

  // One-shot recovery fetch for pending notifications/settings. No polling.
  useEffect(() => {
    if (!token) return;
    fetchPendingNotifications();
  }, [token, fetchPendingNotifications]);

  return { current, isShowing, isResumedAlert, overlayStyle };
}
