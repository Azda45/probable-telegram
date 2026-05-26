"use client";

import { CreditCard } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DashboardSettingsForm } from "../../types";
import SettingsField from "./SettingsField";

interface PayoutSettingsCardProps {
  settingsForm: DashboardSettingsForm;
  setSettingsForm: Dispatch<SetStateAction<DashboardSettingsForm>>;
  onSaveSettings: () => void;
}

export default function PayoutSettingsCard({ settingsForm, setSettingsForm, onSaveSettings }: PayoutSettingsCardProps) {
  return (
    <div className="card h-full" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <h3 className="text-lg font-bold flex items-center" style={{ marginBottom: '1.25rem', gap: '0.5rem' }}>
        <CreditCard className="w-5 h-5 text-[var(--color-success)]" /> Payout Account
      </h3>
      <p className="text-sm text-[var(--color-text-muted)]" style={{ marginBottom: '1.5rem', marginTop: '-0.5rem' }}>Informasi rekening untuk penarikan dana.</p>

      <div className="grid grid-cols-1 flex-1" style={{ rowGap: '1.25rem' }}>
        <SettingsField label="Nama Bank / E-Wallet">
          <input
            type="text"
            className="input"
            value={settingsForm.bank_name || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
            placeholder="Contoh: BCA, Mandiri, GoPay"
          />
        </SettingsField>
        <SettingsField label="Nomor Rekening / No HP">
          <input
            type="text"
            className="input"
            value={settingsForm.bank_account || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, bank_account: e.target.value })}
            placeholder="Nomor rekening yang valid"
          />
        </SettingsField>
      </div>

      <div className="border-t border-[var(--color-border)] flex justify-end" style={{ marginTop: '1.5rem', paddingTop: '1.25rem' }}>
        <button className="btn btn-primary flex items-center" style={{ gap: '0.5rem' }} onClick={onSaveSettings}>
          <CreditCard className="w-4 h-4" />
          Simpan Akun
        </button>
      </div>
    </div>
  );
}
