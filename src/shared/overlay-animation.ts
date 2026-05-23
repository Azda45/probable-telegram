export const OVERLAY_ANIMATION_PRESETS = [
  "slide-up",
  "slide-down",
  "slide-left",
  "slide-right",
  "fade",
  "zoom",
  "bounce",
  "flip",
  "elastic",
  "blur-in",
  "swing",
] as const;

export type OverlayAnimationPreset = (typeof OVERLAY_ANIMATION_PRESETS)[number];

export interface OverlayAnimationSettings {
  overlay_animation: OverlayAnimationPreset;
  overlay_animation_duration: number;
  overlay_animation_enabled: boolean;
}

export const DEFAULT_OVERLAY_ANIMATION_SETTINGS: OverlayAnimationSettings = {
  overlay_animation: "slide-up",
  overlay_animation_duration: 500,
  overlay_animation_enabled: true,
};

export const OVERLAY_ANIMATION_DURATION = {
  min: 200,
  max: 1500,
  step: 50,
} as const;

export const OVERLAY_ANIMATION_OPTIONS: Array<{
  value: OverlayAnimationPreset;
  label: string;
  description: string;
}> = [
  {
    value: "slide-up",
    label: "Slide Up",
    description: "Masuk dari bawah, keluar ke bawah.",
  },
  {
    value: "slide-down",
    label: "Slide Down",
    description: "Masuk dari atas, keluar ke atas.",
  },
  {
    value: "fade",
    label: "Fade",
    description: "Muncul dan hilang halus tanpa gerakan besar.",
  },
  {
    value: "zoom",
    label: "Zoom",
    description: "Membesar lembut dari tengah.",
  },
  {
    value: "bounce",
    label: "Bounce",
    description: "Masuk dengan pantulan ringan.",
  },
  {
    value: "flip",
    label: "Flip",
    description: "Efek putar 3D singkat.",
  },
  {
    value: "slide-left",
    label: "Slide Left",
    description: "Masuk dari kiri, keluar ke kiri.",
  },
  {
    value: "slide-right",
    label: "Slide Right",
    description: "Masuk dari kanan, keluar ke kanan.",
  },
  {
    value: "elastic",
    label: "Elastic",
    description: "Efek stretch elastis yang playful.",
  },
  {
    value: "blur-in",
    label: "Blur In",
    description: "Muncul dari blur ke jelas, modern dan clean.",
  },
  {
    value: "swing",
    label: "Swing",
    description: "Efek ayunan pendulum yang unik.",
  },
];

const PRESET_SET = new Set<string>(OVERLAY_ANIMATION_PRESETS);

export function sanitizeOverlayAnimationPreset(value: unknown): OverlayAnimationPreset {
  return typeof value === "string" && PRESET_SET.has(value)
    ? (value as OverlayAnimationPreset)
    : DEFAULT_OVERLAY_ANIMATION_SETTINGS.overlay_animation;
}

export function sanitizeOverlayAnimationDuration(value: unknown): number {
  const numericValue = Math.round(Number(value));

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_OVERLAY_ANIMATION_SETTINGS.overlay_animation_duration;
  }

  return Math.min(
    OVERLAY_ANIMATION_DURATION.max,
    Math.max(OVERLAY_ANIMATION_DURATION.min, numericValue)
  );
}

export function sanitizeOverlayAnimationEnabled(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "true" || value === "1";
  return DEFAULT_OVERLAY_ANIMATION_SETTINGS.overlay_animation_enabled;
}

export function sanitizeOverlayAnimationSettings(
  value: Partial<Record<keyof OverlayAnimationSettings, unknown>> | null | undefined
): OverlayAnimationSettings {
  return {
    overlay_animation: sanitizeOverlayAnimationPreset(value?.overlay_animation),
    overlay_animation_duration: sanitizeOverlayAnimationDuration(value?.overlay_animation_duration),
    overlay_animation_enabled: sanitizeOverlayAnimationEnabled(value?.overlay_animation_enabled),
  };
}

const OVERLAY_ANIMATION_KEYFRAMES: Record<
  OverlayAnimationPreset,
  { enter: string; exit: string; enterEasing: string; exitEasing: string }
> = {
  "slide-up": {
    enter: "overlayEnterSlideUp",
    exit: "overlayExitSlideUp",
    enterEasing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    exitEasing: "ease-in",
  },
  "slide-down": {
    enter: "overlayEnterSlideDown",
    exit: "overlayExitSlideDown",
    enterEasing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    exitEasing: "ease-in",
  },
  fade: {
    enter: "overlayEnterFade",
    exit: "overlayExitFade",
    enterEasing: "ease-out",
    exitEasing: "ease-in",
  },
  zoom: {
    enter: "overlayEnterZoom",
    exit: "overlayExitZoom",
    enterEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    exitEasing: "ease-in",
  },
  bounce: {
    enter: "overlayEnterBounce",
    exit: "overlayExitBounce",
    enterEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    exitEasing: "cubic-bezier(0.55, 0, 1, 0.45)",
  },
  flip: {
    enter: "overlayEnterFlip",
    exit: "overlayExitFlip",
    enterEasing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    exitEasing: "ease-in",
  },
  "slide-left": {
    enter: "overlayEnterSlideLeft",
    exit: "overlayExitSlideLeft",
    enterEasing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    exitEasing: "ease-in",
  },
  "slide-right": {
    enter: "overlayEnterSlideRight",
    exit: "overlayExitSlideRight",
    enterEasing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    exitEasing: "ease-in",
  },
  elastic: {
    enter: "overlayEnterElastic",
    exit: "overlayExitElastic",
    enterEasing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    exitEasing: "cubic-bezier(0.55, 0, 1, 0.45)",
  },
  "blur-in": {
    enter: "overlayEnterBlurIn",
    exit: "overlayExitBlurIn",
    enterEasing: "ease-out",
    exitEasing: "ease-in",
  },
  swing: {
    enter: "overlayEnterSwing",
    exit: "overlayExitSwing",
    enterEasing: "ease-out",
    exitEasing: "ease-in",
  },
};

export function getOverlayAnimationCss(
  settings: OverlayAnimationSettings,
  phase: "enter" | "exit"
): string {
  if (!settings.overlay_animation_enabled) return "none";

  const preset = OVERLAY_ANIMATION_KEYFRAMES[settings.overlay_animation];
  const keyframeName = phase === "enter" ? preset.enter : preset.exit;
  const easing = phase === "enter" ? preset.enterEasing : preset.exitEasing;

  return `${keyframeName} ${settings.overlay_animation_duration}ms ${easing} forwards`;
}

export function getOverlayAnimationClearDelayMs(settings: OverlayAnimationSettings): number {
  return settings.overlay_animation_enabled ? settings.overlay_animation_duration + 100 : 0;
}
