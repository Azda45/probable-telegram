import { CircleDollarSign, Save } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DashboardSettingsForm } from "../../types";
import SettingsField from "./SettingsField";

interface DonationSettingsCardProps {
  settingsForm: DashboardSettingsForm;
  setSettingsForm: Dispatch<SetStateAction<DashboardSettingsForm>>;
  onSaveSettings: () => void;
}

export default function DonationSettingsCard({ settingsForm, setSettingsForm, onSaveSettings }: DonationSettingsCardProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
        <CircleDollarSign className="w-5 h-5 text-[var(--color-primary)]" /> Pengaturan Donasi
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsField label="Minimal Donasi (Rp)">
          <input
            className="input"
            type="number"
            min={1000}
            step={1000}
            value={settingsForm.min_amount}
            onChange={(e) => setSettingsForm({ ...settingsForm, min_amount: parseInt(e.target.value) || 1000 })}
          />
        </SettingsField>
        <SettingsField label="Maksimal Donasi (Rp)">
          <input
            className="input"
            type="number"
            min={1000}
            step={1000}
            value={settingsForm.max_amount}
            onChange={(e) => setSettingsForm({ ...settingsForm, max_amount: parseInt(e.target.value) || 10000000 })}
          />
        </SettingsField>
      </div>
      <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex justify-end">
        <button className="btn btn-primary flex items-center gap-2" onClick={onSaveSettings}>
          <Save className="w-4 h-4" />
          Simpan Pengaturan Donasi
        </button>
      </div>
    </div>
  );
}
