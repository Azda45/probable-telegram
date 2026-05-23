"use client";

import { CreditCard } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DashboardSettingsForm } from "../../types";

interface PayoutSettingsCardProps {
  settingsForm: DashboardSettingsForm;
  setSettingsForm: Dispatch<SetStateAction<DashboardSettingsForm>>;
  onSaveSettings: () => void;
}

export default function PayoutSettingsCard({ settingsForm, setSettingsForm, onSaveSettings }: PayoutSettingsCardProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Payout Account</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Informasi rekening untuk penarikan dana.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)]">Nama Bank / E-Wallet</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-white placeholder-slate-500"
            value={settingsForm.bank_name || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
            placeholder="Contoh: BCA, Mandiri, GoPay"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)]">Nomor Rekening / No HP</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-white placeholder-slate-500"
            value={settingsForm.bank_account || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, bank_account: e.target.value })}
            placeholder="Nomor rekening yang valid"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onSaveSettings}
          className="px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg shadow-[var(--color-primary)]/20"
        >
          Save Account
        </button>
      </div>
    </div>
  );
}
