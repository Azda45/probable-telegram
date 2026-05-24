"use client";

import { RefreshCcw, Monitor } from "lucide-react";
import AdminEmptyState from "./AdminEmptyState";

interface AdminOverlayCreatorsTabProps {
  creators: any[];
  onResetToken: (id: string) => void;
}

export default function AdminOverlayCreatorsTab({ creators, onResetToken }: AdminOverlayCreatorsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">Overlay Creator</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Creator</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Token Overlay</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {creators.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="font-medium">{c.display_name}</p>
                  <p className="text-sm text-[var(--color-primary)]">@{c.username}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {c.banned_at || c.is_active === 0 ? (
                    <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold uppercase">Banned</span>
                  ) : (
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">Aktif</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-[var(--color-text-muted)]">
                  {c.overlay_token ? `${c.overlay_token.substring(0, 10)}...${c.overlay_token.substring(c.overlay_token.length - 10)}` : <span className="italic">Belum digenerate</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onResetToken(c.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 inline-flex items-center gap-2 transition-colors"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    Reset Token
                  </button>
                </td>
              </tr>
            ))}
            {creators.length === 0 && (
              <AdminEmptyState
                icon={<Monitor className="w-6 h-6" />}
                title="Tidak ada creator"
                description="Belum ada creator yang terdaftar."
                colSpan={4}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
