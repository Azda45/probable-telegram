"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  destroyAlertAudio,
  playNotificationSound,
  preloadAlertSounds,
  stopAlertSounds,
  unlockAlertAudio,
} from "@/components/NotificationSound";
import { formatRupiah } from "@/lib/utils";
import type { OverlayNotification } from "@/lib/types";
import { createRealtimeSocket, type RealtimeClientSocket } from "@/lib/realtime/socket-client";
import { REALTIME_EVENTS, type PublicDonationPayload, type RealtimeEvent } from "@/lib/realtime/events";

interface Settings {
  alert_duration: number;
  alert_sound: string;
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

function OverlayContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

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
        playNotificationSound(settingsRef.current?.alert_sound).catch((error) => {
          console.warn("[overlay-audio] alert playback failed", error);
        });
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

  const fetchPendingNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`/api/overlay?token=${token}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (data.settings) {
        settingsRef.current = data.settings;
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

  if (!token) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#f87171" }}>
        Token overlay tidak ditemukan. Tambahkan ?token=YOUR_TOKEN di URL.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "2rem",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {current && (
        <div
          style={{
            animation: isShowing
              ? isResumedAlert
                ? "none"
                : "overlaySlideIn 0.5s ease-out forwards"
              : "overlaySlideOut 0.5s ease-in forwards",
            width: 420,
            maxWidth: "90vw",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(15,15,35,0.95), rgba(26,26,46,0.95))",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 20,
              padding: "1.5rem 2rem",
              backdropFilter: "blur(20px)",
              animation: "overlayPulse 2s ease-in-out infinite",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow effect */}
            <div
              style={{
                position: "absolute",
                top: -50,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 100,
                background:
                  "radial-gradient(ellipse, rgba(139,92,246,0.3), transparent)",
                animation: "overlayGlow 2s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                💜
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  {current.donor_name}
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {formatRupiah(current.amount)}
                </div>
              </div>
            </div>

            {/* Message */}
            {current.message && (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: "0.75rem 1rem",
                  fontSize: "0.9375rem",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                  position: "relative",
                  zIndex: 1,
                  borderLeft: "3px solid rgba(139,92,246,0.5)",
                }}
              >
                {current.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100vw",
            height: "100vh",
            background: "transparent",
          }}
        />
      }
    >
      <OverlayContent />
    </Suspense>
  );
}
