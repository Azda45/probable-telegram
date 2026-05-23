import { useCallback, useRef, useState } from "react";
import type {
  AlertLifecycleState,
  OverlayLifecycleDurations,
  OverlayTimerPhase,
  OverlayTimerState,
} from "../types";

const TIMER_UPDATE_INTERVAL_MS = 100;

export default function useOverlayTimers(
  isFrozenRef: React.MutableRefObject<boolean>,
  getDurationsForLifecycle: (lifecycle: AlertLifecycleState) => OverlayLifecycleDurations
) {
  const [overlayTimer, setOverlayTimer] = useState<OverlayTimerState | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const clearTimerInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const stopOverlayTimer = useCallback(() => {
    clearTimerInterval();
    setOverlayTimer(null);
  }, [clearTimerInterval]);

  const startOverlayTimer = useCallback(
    (createTimerState: (elapsed: number) => OverlayTimerState, onTick?: (elapsed: number) => boolean | void) => {
      clearTimerInterval();
      let completed = false;

      const updateTimer = (shouldAdvance = true) => {
        if (shouldAdvance && !isFrozenRef.current) elapsedRef.current += TIMER_UPDATE_INTERVAL_MS;
        setOverlayTimer(createTimerState(elapsedRef.current));

        if (shouldAdvance && !isFrozenRef.current && onTick && !completed) {
          completed = Boolean(onTick(elapsedRef.current));
        }
      };

      updateTimer(false);
      timerIntervalRef.current = setInterval(() => updateTimer(true), TIMER_UPDATE_INTERVAL_MS);
    },
    [clearTimerInterval, isFrozenRef]
  );

  const startPreExitTimer = useCallback(
    (lifecycle: AlertLifecycleState, onComplete?: () => void) => {
      const durations = getDurationsForLifecycle(lifecycle);
      const preExitDurationMs = durations.enterDurationMs + durations.alertDurationMs;
      const totalDurationMs = preExitDurationMs + durations.exitDurationMs;

      startOverlayTimer(
        (elapsed) => {
          const phase: OverlayTimerPhase = durations.enterDurationMs > 0 && elapsed < durations.enterDurationMs ? "enter" : "alert";
          const phaseEndMs = phase === "enter" ? durations.enterDurationMs : preExitDurationMs;
          const elapsedForProgress = Math.min(preExitDurationMs, elapsed);

          return {
            phase,
            phaseRemainingMs: Math.max(0, phaseEndMs - elapsed),
            totalRemainingMs: Math.max(0, preExitDurationMs - elapsed) + durations.exitDurationMs,
            elapsedMs: elapsedForProgress,
            totalDurationMs,
            ...durations,
            progress: totalDurationMs > 0 ? Math.min(1, elapsedForProgress / totalDurationMs) : 1,
          };
        },
        (elapsed) => {
          if (elapsed >= preExitDurationMs) {
            if (onComplete) onComplete();
            return true;
          }
          return false;
        }
      );
    },
    [getDurationsForLifecycle, startOverlayTimer]
  );

  const startExitTimer = useCallback(
    (lifecycle: AlertLifecycleState, onComplete?: () => void) => {
      const durations = getDurationsForLifecycle(lifecycle);
      const preExitDurationMs = durations.enterDurationMs + durations.alertDurationMs;
      const totalDurationMs = preExitDurationMs + durations.exitDurationMs;

      startOverlayTimer(
        (elapsed) => {
          const exitElapsedMs = elapsed - preExitDurationMs;
          const exitElapsedForProgress = Math.min(durations.exitDurationMs, exitElapsedMs);
          const totalElapsedMs = Math.min(totalDurationMs, preExitDurationMs + exitElapsedForProgress);

          return {
            phase: "exit",
            phaseRemainingMs: Math.max(0, durations.exitDurationMs - exitElapsedMs),
            totalRemainingMs: Math.max(0, durations.exitDurationMs - exitElapsedMs),
            elapsedMs: totalElapsedMs,
            totalDurationMs,
            ...durations,
            progress: totalDurationMs > 0 ? Math.min(1, totalElapsedMs / totalDurationMs) : 1,
          };
        },
        (elapsed) => {
          if (elapsed >= totalDurationMs && onComplete) {
            onComplete();
            return true;
          }
          return false;
        }
      );
    },
    [getDurationsForLifecycle, startOverlayTimer]
  );

  return { elapsedRef, overlayTimer, startExitTimer, startPreExitTimer, stopOverlayTimer, clearTimerInterval };
}
