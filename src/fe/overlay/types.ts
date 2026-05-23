import type { OverlayNotification } from "@/shared/types/models";
import type { OverlayAnimationSettings } from "@/shared/overlay-animation";

export interface OverlayRuntimeSettings {
  alert_duration: number;
  alert_sound: string;
  overlay_style: string;
  overlay_animation: OverlayAnimationSettings["overlay_animation"];
  overlay_animation_duration: number;
  overlay_animation_enabled: boolean;
  overlay_bg_color: string;
  overlay_border_color: string;
  overlay_text_color: string;
  overlay_message_color: string;
  overlay_accent_color: string;
  overlay_progress_color: string;
  overlay_progress_enabled: boolean;
}

export interface IncomingOverlaySettings {
  alert_duration?: unknown;
  alert_sound?: unknown;
  overlay_style?: unknown;
  overlay_animation?: unknown;
  overlay_animation_duration?: unknown;
  overlay_animation_enabled?: unknown;
  overlay_bg_color?: unknown;
  overlay_border_color?: unknown;
  overlay_text_color?: unknown;
  overlay_message_color?: unknown;
  overlay_accent_color?: unknown;
  overlay_progress_color?: unknown;
  overlay_progress_enabled?: unknown;
}

export interface AlertLifecycleState {
  donationId: string;
  startedAt: number;
  durationMs: number;
  enterDurationMs?: number;
  alertDurationMs?: number;
  exitDurationMs?: number;
  audioPlayed: boolean;
  completed: boolean;
  completedAt?: number;
}

export interface QueuedNotification {
  notif: OverlayNotification;
  forceReplay: boolean;
}

export type OverlayTimerPhase = "enter" | "alert" | "exit";

export interface OverlayTimerState {
  phase: OverlayTimerPhase;
  phaseRemainingMs: number;
  totalRemainingMs: number;
  elapsedMs: number;
  totalDurationMs: number;
  enterDurationMs: number;
  alertDurationMs: number;
  exitDurationMs: number;
  progress: number;
}

export interface OverlayLifecycleDurations {
  enterDurationMs: number;
  alertDurationMs: number;
  exitDurationMs: number;
}
