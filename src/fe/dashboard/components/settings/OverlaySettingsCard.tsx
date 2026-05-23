import { MonitorPlay, Save } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import type { DashboardOverlayForm, OverlayStyle } from "../../types";
import SettingsField from "./SettingsField";
import OverlayAnimationControls from "./OverlayAnimationControls";
import OverlayColorFields from "./OverlayColorFields";
import OverlayProgressToggle from "./OverlayProgressToggle";
import OverlayPreviewCard from "./OverlayPreviewCard";

interface OverlaySettingsCardProps {
  overlayForm: DashboardOverlayForm;
  overlayPreviewNonce: number;
  setOverlayForm: Dispatch<SetStateAction<DashboardOverlayForm>>;
  setOverlayPreviewNonce: Dispatch<SetStateAction<number>>;
  onSaveOverlaySettings: () => void;
}

export default function OverlaySettingsCard({ overlayForm, overlayPreviewNonce, setOverlayForm, setOverlayPreviewNonce, onSaveOverlaySettings }: OverlaySettingsCardProps) {
  const handleSave = () => {
    if (overlayForm.alert_duration < 5000) {
      toast.error("Durasi alert minimal 5000 ms!");
      return;
    }
    onSaveOverlaySettings();
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
        <MonitorPlay className="w-5 h-5 text-[var(--color-primary)]" /> Pengaturan Overlay
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsField label="Durasi Alert (ms)">
          <div className="flex flex-col gap-1">
            <input className="input" type="text" inputMode="numeric" pattern="[0-9]*" value={overlayForm.alert_duration === 0 ? '' : overlayForm.alert_duration} onChange={(e) => setOverlayForm({ ...overlayForm, alert_duration: e.target.value === '' ? 0 : Number(e.target.value.replace(/\D/g, '')) })} />
            <p className="text-xs text-[var(--color-message)]">Minimal 5000 ms (1 detik = 1000 ms).</p>
          </div>
        </SettingsField>
        <SettingsField label="Suara Notifikasi">
          <select className="input" value={overlayForm.alert_sound} onChange={(e) => setOverlayForm({ ...overlayForm, alert_sound: e.target.value })}>
            <option value="default">Default (Ting!)</option>
            <option value="none">Tanpa Suara</option>
          </select>
        </SettingsField>
        <SettingsField label="Gaya Overlay (Shadow)">
          <select className="input" value={overlayForm.overlay_style} onChange={(e) => setOverlayForm({ ...overlayForm, overlay_style: e.target.value as OverlayStyle })}>
            <option value="right">Kanan Atas (Default)</option>
            <option value="left">Kiri Atas</option>
            <option value="none">Datar / Tanpa Shadow Biasa</option>
          </select>
        </SettingsField>
        <SettingsField label="Teks Aksi (Contoh: berdonasi)">
          <div className="flex flex-col gap-1">
            <input className="input" type="text" maxLength={50} value={overlayForm.action_text} onChange={(e) => setOverlayForm({ ...overlayForm, action_text: e.target.value })} placeholder="berdonasi" />
            <p className="text-xs text-[var(--color-message)]">Teks yang muncul di antara nama dan nominal.</p>
          </div>
        </SettingsField>
        <OverlayAnimationControls overlayForm={overlayForm} setOverlayForm={setOverlayForm} />
        <OverlayColorFields overlayForm={overlayForm} setOverlayForm={setOverlayForm} />
        <OverlayProgressToggle overlayForm={overlayForm} setOverlayForm={setOverlayForm} />
      </div>
      <OverlayPreviewCard overlayForm={overlayForm} overlayPreviewNonce={overlayPreviewNonce} setOverlayPreviewNonce={setOverlayPreviewNonce} />
      <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex justify-end">
        <button className="btn btn-primary flex w-full items-center justify-center gap-2 sm:w-auto" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Simpan Pengaturan Overlay
        </button>
      </div>
    </div>
  );
}
