import {
  DEFAULT_OVERLAY_ANIMATION_SETTINGS,
  sanitizeOverlayAnimationSettings,
} from "@/shared/overlay-animation";
import type { User } from "@/shared/types/models";
import type {
  DashboardOverlayForm,
  DashboardOverlaySettingsSource,
  DashboardSettingsForm,
} from "./types";

export const initialDashboardSettingsForm: DashboardSettingsForm = {
  display_name: "",
  bio: "",
  min_amount: 1000,
  avatar_url: "",
  max_amount: 10000000,
};

export const initialDashboardOverlayForm: DashboardOverlayForm = {
  alert_duration: 5000,
  alert_sound: "default",
  overlay_style: "right",
  overlay_bg_color: "#1e293b",
  overlay_border_color: "#334155",
  overlay_text_color: "#fafafa",
  overlay_message_color: "#a1a1aa",
  overlay_accent_color: "#818cf8",
  overlay_progress_color: "#818cf8",
  overlay_progress_enabled: true,
  ...DEFAULT_OVERLAY_ANIMATION_SETTINGS,
};

export function mapUserToSettingsForm(user: User): DashboardSettingsForm {
  return {
    display_name: user.display_name || "",
    bio: user.bio || "",
    min_amount: user.min_amount || 1000,
    avatar_url: user.avatar_url || "",
    max_amount: user.max_amount || 10000000,
  };
}

export function mapOverlaySettingsToForm(source: DashboardOverlaySettingsSource): DashboardOverlayForm {
  const animationSettings = sanitizeOverlayAnimationSettings(source);

  return {
    alert_duration: source.alert_duration ?? 5000,
    alert_sound: source.alert_sound || "default",
    overlay_style: source.overlay_style || "right",
    overlay_bg_color: source.overlay_bg_color || "#1e293b",
    overlay_border_color: source.overlay_border_color || "#334155",
    overlay_text_color: source.overlay_text_color || "#fafafa",
    overlay_message_color: source.overlay_message_color || "#a1a1aa",
    overlay_accent_color: source.overlay_accent_color || "#818cf8",
    overlay_progress_color: source.overlay_progress_color || "#818cf8",
    overlay_progress_enabled: source.overlay_progress_enabled === undefined
      ? true
      : Boolean(source.overlay_progress_enabled),
    ...animationSettings,
  };
}
