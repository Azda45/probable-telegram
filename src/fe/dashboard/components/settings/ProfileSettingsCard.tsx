import { Save, User as UserIcon } from "lucide-react";
import { FaYoutube, FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
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
    <div className="card h-full" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <h3 className="text-lg font-bold flex items-center" style={{ marginBottom: '1.25rem', gap: '0.5rem' }}>
        <UserIcon className="w-5 h-5 text-[var(--color-primary)]" /> Profil
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ rowGap: '1.25rem', columnGap: '1rem' }}>
        <SettingsField label="Nama Tampilan" className="md:col-span-2">
          <input
            className="input"
            maxLength={100}
            value={settingsForm.display_name}
            onChange={(e) => setSettingsForm({ ...settingsForm, display_name: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="URL Avatar" className="md:col-span-2">
          <input
            className="input"
            maxLength={500}
            value={settingsForm.avatar_url}
            onChange={(e) => setSettingsForm({ ...settingsForm, avatar_url: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />
        </SettingsField>
        <SettingsField label="Bio" className="md:col-span-2">
          <div style={{ position: 'relative' }}>
            <textarea
              className="input"
              maxLength={150}
              value={settingsForm.bio || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
              placeholder="Ceritakan tentang dirimu..."
              rows={4}
              style={{ resize: 'none', wordBreak: 'break-word', paddingBottom: '1.5rem' }}
            />
            <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {(settingsForm.bio || "").length}/150
            </div>
          </div>
        </SettingsField>
      </div>

      <div className="border-t border-[var(--color-border)]" style={{ marginTop: '2rem', paddingTop: '1.5rem' }}>
        <h4 className="text-md font-semibold text-[var(--color-text-secondary)]" style={{ marginBottom: '1rem' }}>Tautan Media Sosial</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ rowGap: '1rem', columnGap: '1rem' }}>
          <SettingsField label={<><FaYoutube className="w-[14px] h-[14px] text-[#FF0000]" /> YouTube</>} className="md:col-span-2">
            <input
              className="input"
              maxLength={255}
              value={settingsForm.youtube_url || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, youtube_url: e.target.value })}
              placeholder="https://youtube.com/@channel"
            />
          </SettingsField>

          <SettingsField label={<><FaInstagram className="w-[14px] h-[14px] text-[#E1306C]" /> Instagram</>} className="md:col-span-2">
            <input
              className="input"
              maxLength={255}
              value={settingsForm.instagram_url || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
              placeholder="https://instagram.com/username"
            />
          </SettingsField>

          <SettingsField label={<><FaTwitter className="w-[14px] h-[14px] text-[#1DA1F2]" /> Twitter / X</>} className="md:col-span-2">
            <input
              className="input"
              maxLength={255}
              value={settingsForm.twitter_url || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, twitter_url: e.target.value })}
              placeholder="https://twitter.com/username"
            />
          </SettingsField>

          <SettingsField label={<><FaFacebook className="w-[14px] h-[14px] text-[#1877F2]" /> Facebook</>} className="md:col-span-2">
            <input
              className="input"
              maxLength={255}
              value={settingsForm.facebook_url || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
              placeholder="https://facebook.com/username"
            />
          </SettingsField>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] flex justify-end mt-auto" style={{ marginTop: '1.5rem', paddingTop: '1.25rem' }}>
        <button className="btn btn-primary flex items-center" style={{ gap: '0.5rem' }} onClick={onSaveSettings}>
          <Save className="w-4 h-4" />
          Simpan Profil
        </button>
      </div>
    </div>
  );
}
