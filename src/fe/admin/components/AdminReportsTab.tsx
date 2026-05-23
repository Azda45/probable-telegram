"use client";

import { Flag, CheckCircle, XCircle } from "lucide-react";

interface AdminReportsTabProps {
  reports: any[];
  onResolve: (id: string, status: string) => void;
}

export default function AdminReportsTab({ reports, onResolve }: AdminReportsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
        <Flag className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold">User Reports</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Target User</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Reporter</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Reason</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--color-primary)]">
                  @{r.target_username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {r.reporter_name || "Anonymous"}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                  {r.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {r.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold">Pending</span>}
                  {r.status === 'resolved' && <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold">Resolved</span>}
                  {r.status === 'dismissed' && <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-bold">Dismissed</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  {r.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => onResolve(r.id, 'resolved')}
                        className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle size={14} /> Resolve
                      </button>
                      <button 
                        onClick={() => onResolve(r.id, 'dismissed')}
                        className="px-3 py-1.5 bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <XCircle size={14} /> Dismiss
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                  Belum ada laporan dari user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
