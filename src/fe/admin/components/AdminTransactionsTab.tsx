"use client";

import AdminEmptyState from "./AdminEmptyState";
import { Receipt } from "lucide-react";

interface AdminTransactionsTabProps {
  donations: any[];
}

export default function AdminTransactionsTab({ donations }: AdminTransactionsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <h2 className="text-xl font-bold">Daftar Transaksi</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Tanggal</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Donatur</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Streamer</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Jumlah</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {donations.map((d) => (
              <tr key={d.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {new Date(d.created_at).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{d.donor_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-primary)]">@{d.streamer_username}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-400">
                  Rp {Number(d.amount).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {d.transaction_status === 'settlement' || d.transaction_status === 'capture' ? (
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">Sukses</span>
                  ) : d.transaction_status === 'pending' ? (
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>
                  ) : (
                    <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold uppercase">{d.transaction_status || "Gagal"}</span>
                  )}
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <AdminEmptyState
                icon={<Receipt className="w-6 h-6" />}
                title="Tidak ada transaksi"
                description="Belum ada transaksi donasi yang tercatat."
                colSpan={5}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
