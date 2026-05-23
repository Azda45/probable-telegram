import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_OVERLAY_ANIMATION_SETTINGS,
  sanitizeOverlayAnimationSettings,
  type OverlayAnimationSettings,
} from "@/shared/overlay-animation";
import type { IncomingOverlaySettings, OverlayRuntimeSettings } from "../types";

export default function useOverlaySettingsState() {
  const settingsRef = useRef<OverlayRuntimeSettings | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<string>("right");
  const [overlayAnimation, setOverlayAnimation] = useState<OverlayAnimationSettings>(DEFAULT_OVERLAY_ANIMATION_SETTINGS);
  const [overlayColors, setOverlayColors] = useState({
    overlay_bg_color: "#1e293b",
    overlay_border_color: "#334155",
    overlay_text_color: "#fafafa",
    overlay_message_color: "#a1a1aa",
    overlay_accent_color: "#818cf8",
    overlay_progress_color: "#818cf8",
    overlay_progress_enabled: true,
    action_text: "berdonasi",
  });

  const applyOverlaySettings = useCallback((settings: IncomingOverlaySettings | null | undefined) => {
    if (!settings) return;

    const animationSettings = sanitizeOverlayAnimationSettings(settings);
    const alertDuration = Number(settings.alert_duration);
    const alertSound = typeof settings.alert_sound === "string" ? settings.alert_sound : "default";
    const nextOverlayStyle = typeof settings.overlay_style === "string" ? settings.overlay_style : "right";
    const colors = {
      overlay_bg_color: typeof settings.overlay_bg_color === "string" ? settings.overlay_bg_color : "#1e293b",
      overlay_border_color: typeof settings.overlay_border_color === "string" ? settings.overlay_border_color : "#334155",
      overlay_text_color: typeof settings.overlay_text_color === "string" ? settings.overlay_text_color : "#fafafa",
      overlay_message_color: typeof settings.overlay_message_color === "string" ? settings.overlay_message_color : "#a1a1aa",
      overlay_accent_color: typeof settings.overlay_accent_color === "string" ? settings.overlay_accent_color : "#818cf8",
      overlay_progress_color: typeof settings.overlay_progress_color === "string" ? settings.overlay_progress_color : "#818cf8",
      overlay_progress_enabled: settings.overlay_progress_enabled === undefined ? true : Boolean(settings.overlay_progress_enabled),
      action_text: typeof settings.action_text === "string" ? settings.action_text : "berdonasi",
    };

    settingsRef.current = {
      alert_duration: Number.isFinite(alertDuration) ? Math.max(5000, alertDuration) : 5000,
      alert_sound: alertSound,
      overlay_style: nextOverlayStyle,
      ...colors,
      ...animationSettings,
    };
    setOverlayStyle(nextOverlayStyle);
    setOverlayAnimation(animationSettings);
    setOverlayColors(colors);
  }, []);

  return { applyOverlaySettings, overlayAnimation, overlayColors, overlayStyle, settingsRef };
}
