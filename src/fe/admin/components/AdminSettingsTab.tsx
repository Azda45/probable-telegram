"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface AdminSettingsTabProps {
  initialSettings: Record<string, string>;
  onSave: (settings: Record<string, string>) => void;
}

export default function AdminSettingsTab({ initialSettings, onSave }: AdminSettingsTabProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(settings);
    setIsSaving(false);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <h2 className="text-xl font-bold">Platform Settings</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div className="p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-semibold mb-2">Platform Fee Percentage (%)</label>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Potongan platform yang dikenakan untuk setiap donasi masuk.</p>
          <input 
            type="number"
            value={settings.platform_fee_percentage || "5"}
            onChange={(e) => handleChange("platform_fee_percentage", e.target.value)}
            className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Minimum Withdrawal Amount (Rp)</label>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Batas minimum saldo yang bisa ditarik oleh kreator.</p>
          <input 
            type="number"
            value={settings.min_withdrawal_amount || "50000"}
            onChange={(e) => handleChange("min_withdrawal_amount", e.target.value)}
            className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Maintenance Mode</label>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Aktifkan untuk memblokir akses ke web (kecuali admin).</p>
          <select
            value={settings.maintenance_mode || "false"}
            onChange={(e) => handleChange("maintenance_mode", e.target.value)}
            className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          >
            <option value="false">Off (Normal)</option>
            <option value="true">On (Maintenance)</option>
          </select>
        </div>

      </div>
    </div>
  );
}
