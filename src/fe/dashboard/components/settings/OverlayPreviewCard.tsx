import type { Dispatch, SetStateAction } from "react";
import OverlayAlertCard from "@/fe/overlay/components/OverlayAlertCard";
import { OVERLAY_ANIMATION_OPTIONS, getOverlayAnimationCss, sanitizeOverlayAnimationSettings } from "@/shared/overlay-animation";
import { getOverlayAppearance } from "@/shared/overlay-appearance";
import type { DashboardOverlayForm } from "../../types";

interface OverlayPreviewCardProps {
  overlayForm: DashboardOverlayForm;
  overlayPreviewNonce: number;
  setOverlayPreviewNonce: Dispatch<SetStateAction<number>>;
}

export default function OverlayPreviewCard({ overlayForm, overlayPreviewNonce, setOverlayPreviewNonce }: OverlayPreviewCardProps) {
  const overlayAnimationSettings = sanitizeOverlayAnimationSettings(overlayForm);
  const selectedOverlayAnimation = OVERLAY_ANIMATION_OPTIONS.find(
    (option) => option.value === overlayAnimationSettings.overlay_animation
  );
  const previewAppearance = getOverlayAppearance(overlayForm.overlay_style);
  const previewShadowLabel =
    overlayForm.overlay_style === "left"
      ? "Shadow kiri atas"
      : overlayForm.overlay_style === "right"
        ? "Shadow kanan atas"
        : "Tanpa shadow aksen";

  return (
    <div className="clear-both mt-10 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#0f172a]">
      <div className="flex flex-col gap-3 border-b border-[#334155] px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Preview Alert</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
            {previewShadowLabel} · {overlayForm.overlay_animation_enabled ? selectedOverlayAnimation?.label : "Animasi mati"}
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={() => setOverlayPreviewNonce((value) => value + 1)}>
          Ulangi
        </button>
      </div>
      <div className="flex min-h-[250px] items-center justify-center overflow-hidden bg-transparent px-4 py-8 sm:px-8">
        <div
          key={`${overlayPreviewNonce}-${overlayForm.overlay_style}-${overlayAnimationSettings.overlay_animation}-${overlayAnimationSettings.overlay_animation_duration}-${overlayAnimationSettings.overlay_animation_enabled}`}
          className={`overlay-alert-shell ${previewAppearance.wrapperClass}`}
          style={{ animation: getOverlayAnimationCss(overlayAnimationSettings, "enter") }}
        >
          <OverlayAlertCard donorName="ViewerKeren" amount={27000} message="Semangat streamnya!" shadowClass={previewAppearance.shadowClass} colors={overlayForm} />
          {overlayForm.overlay_progress_enabled && (
            <div className="mt-3 flex w-full items-center gap-3 rounded-full border border-[#334155]/70 bg-[#0f172a]/75 px-3 py-2 shadow-lg backdrop-blur-sm">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1e293b]">
                <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: overlayForm.overlay_progress_color }} />
              </div>
              <span className="min-w-[3.25rem] text-right text-xs font-semibold tabular-nums text-[#cbd5e1]">3.6s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
