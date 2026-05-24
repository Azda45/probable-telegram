import { useCallback, useEffect, useRef, useState } from "react";
import { playNotificationSound, stopAlertSounds } from "../components/NotificationSound";
import type { OverlayNotification } from "@/shared/types/models";
import { REALTIME_EVENTS } from "@/shared/realtime/events";
import type { RealtimeClientSocket } from "@/shared/realtime/socket-client";
import { sanitizeOverlayAnimationSettings } from "@/shared/overlay-animation";
import type { AlertLifecycleState, OverlayLifecycleDurations, QueuedNotification } from "../types";
import useOverlayAudio from "./useOverlayAudio";
import useOverlayRealtime from "./useOverlayRealtime";
import useOverlaySettingsState from "./useOverlaySettingsState";
import useOverlayStorage from "./useOverlayStorage";
import useOverlayTimers from "./useOverlayTimers";

export type { OverlayTimerPhase, OverlayTimerState } from "../types";

export function useOverlay(token: string | null) {
  const [current, setCurrent] = useState<OverlayNotification | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [isResumedAlert, setIsResumedAlert] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCensored, setIsCensored] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  const activeNotifIdRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const showingRef = useRef(false);
  const socketRef = useRef<RealtimeClientSocket | null>(null);
  const isFrozenRef = useRef(false);

  const { applyOverlaySettings, overlayAnimation, overlayColors, overlayStyle, settingsRef } = useOverlaySettingsState();
  const { loadAlertState, saveAlertState } = useOverlayStorage(token);
  useOverlayAudio();

  const syncServerQueuedCount = useCallback((serverQueuedCount: number, paused: boolean) => {
    setQueuedCount(paused ? Math.max(0, serverQueuedCount) : 0);
  }, []);

  const getLifecycleDurations = useCallback((): OverlayLifecycleDurations => {
    const animationSettings = sanitizeOverlayAnimationSettings(settingsRef.current);
    const animationDurationMs = animationSettings.overlay_animation_enabled ? animationSettings.overlay_animation_duration : 0;

    return {
      enterDurationMs: animationDurationMs,
      alertDurationMs: settingsRef.current?.alert_duration ?? 5000,
      exitDurationMs: animationDurationMs,
    };
  }, [settingsRef]);

  const getDurationsForLifecycle = useCallback((lifecycle: AlertLifecycleState): OverlayLifecycleDurations => {
    const currentDurations = getLifecycleDurations();
    const enterDurationMs = lifecycle.enterDurationMs ?? currentDurations.enterDurationMs;
    const alertDurationMs = lifecycle.alertDurationMs ?? Math.max(0, lifecycle.durationMs - enterDurationMs);

    return {
      enterDurationMs,
      alertDurationMs,
      exitDurationMs: lifecycle.exitDurationMs ?? currentDurations.exitDurationMs,
    };
  }, [getLifecycleDurations]);

  const { elapsedRef, overlayTimer, startExitTimer, startPreExitTimer, stopOverlayTimer, clearTimerInterval } =
    useOverlayTimers(isFrozenRef, getDurationsForLifecycle);

  useEffect(() => () => clearTimerInterval(), [clearTimerInterval]);

  const createFreshAlertState = useCallback((notif: OverlayNotification): AlertLifecycleState => {
    const durations = getLifecycleDurations();
    return {
      donationId: notif.id,
      startedAt: Date.now(),
      durationMs: durations.enterDurationMs + durations.alertDurationMs,
      ...durations,
      audioPlayed: false,
      completed: false,
    };
  }, [getLifecycleDurations]);

  const ackNotification = useCallback((donationId: string) => {
    const completedState = loadAlertState(donationId);
    if (completedState) saveAlertState({ ...completedState, completed: true, completedAt: Date.now() });

    if (socketRef.current?.connected) {
      socketRef.current.emit(REALTIME_EVENTS.OVERLAY_ACK, {
        donationId,
        displayedAt: new Date().toISOString(),
      });
    }
  }, [loadAlertState, saveAlertState]);

  const showNotification = useCallback(({ notif, forceReplay }: QueuedNotification) => {
    elapsedRef.current = 0;
    const existingState = forceReplay ? null : loadAlertState(notif.id);
    const lifecycle = existingState || createFreshAlertState(notif);

    if (existingState && !forceReplay) {
      elapsedRef.current = Math.min(Date.now() - existingState.startedAt, lifecycle.durationMs);
    }

    if (lifecycle.completed || lifecycle.durationMs - elapsedRef.current <= 0) {
      stopOverlayTimer();
      saveAlertState({ ...lifecycle, completed: true, completedAt: Date.now() });
      ackNotification(notif.id);
      return;
    }

    saveAlertState(lifecycle);
    showingRef.current = true;
    activeNotifIdRef.current = notif.id;
    setCurrent(notif);
    setIsResumedAlert(Boolean(existingState && elapsedRef.current > 0 && !forceReplay));
    setIsShowing(true);

    const hideAndNext = () => {
      if (activeNotifIdRef.current !== notif.id) return;
      const completedLifecycle = { ...lifecycle, audioPlayed: true, completed: true, completedAt: Date.now() };

      startExitTimer(lifecycle, () => {
        if (activeNotifIdRef.current === notif.id) {
          setCurrent(null);
          setIsResumedAlert(false);
          showingRef.current = false;
          activeNotifIdRef.current = null;
          stopOverlayTimer();
        }
        saveAlertState(completedLifecycle);
        ackNotification(notif.id);
      });
      setIsShowing(false);
    };

    startPreExitTimer(lifecycle, hideAndNext);
    if (!lifecycle.audioPlayed && settingsRef.current?.alert_sound !== "none") {
      saveAlertState({ ...lifecycle, audioPlayed: true });
      playNotificationSound(settingsRef.current?.alert_sound).catch((error) => {
        console.warn("[overlay-audio] alert playback failed", error);
      });
    }
  }, [
    ackNotification,
    createFreshAlertState,
    elapsedRef,
    loadAlertState,
    saveAlertState,
    settingsRef,
    startExitTimer,
    startPreExitTimer,
    stopOverlayTimer,
  ]);

  const enqueueNotification = useCallback((notif: OverlayNotification, forceReplay = false) => {
    console.log(`[overlay] enqueueNotification received: ${notif.id}, forceReplay: ${forceReplay}, showing: ${showingRef.current}`);
    const amount = Number(notif.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log(`[overlay] invalid amount, acking immediately: ${notif.id}`);
      ackNotification(notif.id);
      return;
    }

    if (!forceReplay && seenIdsRef.current.has(notif.id)) {
      console.log(`[overlay] already seen, dropping: ${notif.id}`);
      return;
    }
    seenIdsRef.current.add(notif.id);

    if (!isFrozenRef.current && !showingRef.current) {
      console.log(`[overlay] showing notification: ${notif.id}`);
      showNotification({ notif: { ...notif, amount }, forceReplay });
    } else {
      console.log(`[overlay] skipped showing: isFrozen=${isFrozenRef.current}, showing=${showingRef.current}`);
    }
  }, [ackNotification, showNotification]);

  const handlePendingNotification = useCallback((notif: OverlayNotification) => {
    const storedState = loadAlertState(notif.id);
    if (storedState?.completed) {
      ackNotification(notif.id);
      return;
    }
    enqueueNotification(notif);
  }, [ackNotification, enqueueNotification, loadAlertState]);

  const skipActiveNotification = useCallback(() => {
    const donationId = activeNotifIdRef.current;
    if (!donationId) return;

    const lifecycle = loadAlertState(donationId);
    stopAlertSounds();
    stopOverlayTimer();
    activeNotifIdRef.current = null;
    showingRef.current = false;
    setCurrent(null);
    setIsShowing(false);
    setIsResumedAlert(false);

    if (lifecycle) saveAlertState({ ...lifecycle, audioPlayed: true, completed: true, completedAt: Date.now() });
    ackNotification(donationId);
  }, [ackNotification, loadAlertState, saveAlertState, stopOverlayTimer]);

  const handleToggleCensor = useCallback((newIsCensored: boolean) => {
    setIsCensored(newIsCensored);
  }, []);

  const setFrozenState = useCallback((value: boolean) => {
    isFrozenRef.current = value;
  }, []);

  useOverlayRealtime({
    applyOverlaySettings,
    enqueueNotification,
    handlePendingNotification,
    isFrozenRef,
    setIsFrozen: setFrozenState,
    setIsPaused,
    setIsCensored: handleToggleCensor,
    skipActiveNotification,
    socketRef,
    syncServerQueuedCount,
    token,
  });

  return { current, isShowing, isResumedAlert, isPaused, isCensored, queuedCount, overlayStyle, overlayAnimation, overlayColors, overlayTimer };
}
