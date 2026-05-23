import type { Dispatch, SetStateAction } from "react";
import type { DashboardOverlayForm } from "../../types";
import {
  OVERLAY_ANIMATION_DURATION,
  OVERLAY_ANIMATION_OPTIONS,
  sanitizeOverlayAnimationSettings,
} from "@/shared/overlay-animation";
import SettingsField from "./SettingsField";

interface OverlayAnimationControlsProps {
  overlayForm: DashboardOverlayForm;
  setOverlayForm: Dispatch<SetStateAction<DashboardOverlayForm>>;
}

export default function OverlayAnimationControls({ overlayForm, setOverlayForm }: OverlayAnimationControlsProps) {
  const overlayAnimationSettings = sanitizeOverlayAnimationSettings(overlayForm);
  const overlayAnimationSelectValue = overlayAnimationSettings.overlay_animation_enabled
    ? overlayAnimationSettings.overlay_animation
    : "off";
  const selectedOverlayAnimation = OVERLAY_ANIMATION_OPTIONS.find(
    (option) => option.value === overlayAnimationSettings.overlay_animation
  );

  return (
    <>
      <SettingsField label="Animasi Overlay">
        <select
          className="input"
          value={overlayAnimationSelectValue}
          onChange={(e) => {
            const value = e.target.value;
            setOverlayForm(
              value === "off"
                ? { ...overlayForm, overlay_animation_enabled: false }
                : {
                  ...overlayForm,
                  overlay_animation_enabled: true,
                  overlay_animation: value as DashboardOverlayForm["overlay_animation"],
                }
            );
          }}
        >
          <option value="off">Mati / Tanpa Animasi</option>
          {OVERLAY_ANIMATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </SettingsField>
      <div className="flex flex-col gap-3 sm:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 p-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Kecepatan Animasi</label>
          <span className="rounded-full bg-[var(--color-surface-elevated)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary-light)]">
            {overlayForm.overlay_animation_enabled ? `${overlayForm.overlay_animation_duration}ms` : "Mati"}
          </span>
        </div>
        <input
          className="h-2 w-full cursor-pointer accent-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          type="range"
          min={OVERLAY_ANIMATION_DURATION.min}
          max={OVERLAY_ANIMATION_DURATION.max}
          step={OVERLAY_ANIMATION_DURATION.step}
          value={overlayForm.overlay_animation_duration}
          onChange={(e) => setOverlayForm({ ...overlayForm, overlay_animation_duration: parseInt(e.target.value) })}
          disabled={!overlayForm.overlay_animation_enabled}
        />
        <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
          <span>Cepat</span>
          <span>Lambat</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] ml-1">
          {overlayForm.overlay_animation_enabled && selectedOverlayAnimation
            ? selectedOverlayAnimation.description
            : "Alert langsung muncul dan hilang tanpa transisi visual."}
        </p>
      </div>
    </>
  );
}
