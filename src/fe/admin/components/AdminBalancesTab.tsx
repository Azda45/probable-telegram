"use client";

import AdminEmptyState from "./AdminEmptyState";
import { CreditCard } from "lucide-react";

interface AdminBalancesTabProps {
  balances: any[];
}

export default function AdminBalancesTab({ balances }: AdminBalancesTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">Saldo Creator</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Creator</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Total Diterima</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Sudah Ditarik</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Saldo Saat Ini</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {balances.map((b) => (
              <tr key={b.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-primary)]">
                  @{b.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-muted)]">
                  Rp {Number(b.total_received).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-muted)]">
                  Rp {Number(b.withdrawn_amount).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-400">
                  Rp {Number(b.current_balance).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
            {balances.length === 0 && (
              <AdminEmptyState
                icon={<CreditCard className="w-6 h-6" />}
                title="Tidak ada creator"
                description="Belum ada data saldo creator."
                colSpan={4}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
