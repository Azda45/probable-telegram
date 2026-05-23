import type { Dispatch, SetStateAction } from "react";
import type { DashboardOverlayForm } from "../../types";

const COLOR_FIELDS = [
  ["overlay_bg_color", "Background"],
  ["overlay_border_color", "Border"],
  ["overlay_text_color", "Teks utama"],
  ["overlay_message_color", "Teks pesan"],
  ["overlay_accent_color", "Aksen nama/nominal"],
  ["overlay_progress_color", "Progress bar"],
] as const satisfies ReadonlyArray<readonly [keyof Pick<DashboardOverlayForm,
  "overlay_bg_color" | "overlay_border_color" | "overlay_text_color" | "overlay_message_color" | "overlay_accent_color" | "overlay_progress_color"
>, string]>;

interface OverlayColorFieldsProps {
  overlayForm: DashboardOverlayForm;
  setOverlayForm: Dispatch<SetStateAction<DashboardOverlayForm>>;
}

export default function OverlayColorFields({ overlayForm, setOverlayForm }: OverlayColorFieldsProps) {
  return (
    <>
      {COLOR_FIELDS.map(([key, label]) => (
        <div key={key} className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/45 p-3">
          <label className="text-[12px] font-semibold text-[var(--color-text-secondary)]">{label}</label>
          <div className="flex items-center gap-2">
            <input
              className="h-10 w-11 shrink-0 cursor-pointer rounded-lg border border-[var(--color-border)] bg-transparent p-1"
              type="color"
              value={overlayForm[key]}
              onChange={(e) => setOverlayForm({ ...overlayForm, [key]: e.target.value })}
            />
            <input
              className="input min-w-0 flex-1 uppercase"
              value={overlayForm[key]}
              onChange={(e) => setOverlayForm({ ...overlayForm, [key]: e.target.value })}
              maxLength={7}
            />
          </div>
        </div>
      ))}
    </>
  );
}
