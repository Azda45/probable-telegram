import { useCallback } from "react";
import type { AlertLifecycleState } from "../types";

const ALERT_STATE_PREFIX = "overlay-alert-state";
const COMPLETED_STATE_TTL_MS = 24 * 60 * 60 * 1000;

export default function useOverlayStorage(token: string | null) {
  const getAlertStorageKey = useCallback(
    (donationId: string) => `${ALERT_STATE_PREFIX}:${token || "no-token"}:${donationId}`,
    [token]
  );

  const loadAlertState = useCallback((donationId: string): AlertLifecycleState | null => {
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
  }, [getAlertStorageKey]);

  const saveAlertState = useCallback((state: AlertLifecycleState) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(getAlertStorageKey(state.donationId), JSON.stringify(state));
    } catch (error) {
      console.warn("[overlay-lifecycle] failed to save alert state", { donationId: state.donationId, error });
    }
  }, [getAlertStorageKey]);

  return { loadAlertState, saveAlertState };
}
