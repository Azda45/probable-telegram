import { Save, User as UserIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DashboardSettingsForm } from "../../types";
import SettingsField from "./SettingsField";

interface ProfileSettingsCardProps {
  settingsForm: DashboardSettingsForm;
  setSettingsForm: Dispatch<SetStateAction<DashboardSettingsForm>>;
  onSaveSettings: () => void;
}

export default function ProfileSettingsCard({ settingsForm, setSettingsForm, onSaveSettings }: ProfileSettingsCardProps) {
  return (
    <div className="card h-full">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
        <UserIcon className="w-5 h-5 text-[var(--color-primary)]" /> Profil
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
        <SettingsField label="Nama Tampilan" className="md:col-span-2">
          <input
            className="input"
            value={settingsForm.display_name}
            onChange={(e) => setSettingsForm({ ...settingsForm, display_name: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="URL Avatar" className="md:col-span-2">
          <input
            className="input"
            value={settingsForm.avatar_url}
            onChange={(e) => setSettingsForm({ ...settingsForm, avatar_url: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />
        </SettingsField>
        <SettingsField label="Bio" className="md:col-span-2">
          <textarea
            className="input"
            value={settingsForm.bio}
            onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
            placeholder="Ceritakan tentang dirimu..."
            rows={4}
          />
        </SettingsField>
      </div>
      <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex justify-end">
        <button className="btn btn-primary flex items-center gap-2" onClick={onSaveSettings}>
          <Save className="w-4 h-4" />
          Simpan Profil
        </button>
      </div>
    </div>
  );
}
