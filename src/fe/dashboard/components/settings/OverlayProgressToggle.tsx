import type { Dispatch, SetStateAction } from "react";
import type { DashboardOverlayForm } from "../../types";

interface OverlayProgressToggleProps {
  overlayForm: DashboardOverlayForm;
  setOverlayForm: Dispatch<SetStateAction<DashboardOverlayForm>>;
}

export default function OverlayProgressToggle({ overlayForm, setOverlayForm }: OverlayProgressToggleProps) {
  return (
    <div className="sm:col-span-2 mt-2 mb-8 flex min-h-[88px] flex-col items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-4 sm:flex-row sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">Tampilkan Progress Bar</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">Matikan kalau tidak ingin timer/progress muncul di overlay.</p>
      </div>
      <button
        type="button"
        className={`btn btn-sm h-9 shrink-0 px-5 ${overlayForm.overlay_progress_enabled ? "btn-primary" : "btn-secondary"}`}
        onClick={() => setOverlayForm({ ...overlayForm, overlay_progress_enabled: !overlayForm.overlay_progress_enabled })}
      >
        {overlayForm.overlay_progress_enabled ? "Aktif" : "Nonaktif"}
      </button>
    </div>
  );
}
