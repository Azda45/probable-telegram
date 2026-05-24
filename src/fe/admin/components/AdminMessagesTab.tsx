"use client";

import { Trash2, MessageSquare } from "lucide-react";
import AdminEmptyState from "./AdminEmptyState";

interface AdminMessagesTabProps {
  messages: any[];
  onDelete: (id: string) => void;
}

export default function AdminMessagesTab({ messages, onDelete }: AdminMessagesTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">Pesan Donasi</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Tanggal</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Streamer</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Donatur</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Jumlah</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Pesan</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {messages.map((m) => (
              <tr key={m.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {new Date(m.created_at).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-primary)] font-medium">
                  @{m.streamer_username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {m.donor_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-400">
                  Rp {Number(m.amount).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-sm max-w-[300px] break-words">
                  <span className={m.message.includes("[Pesan telah dihapus") ? "text-red-400 italic" : ""}>
                    {m.message}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {!m.message.includes("[Pesan telah dihapus") && (
                    <button 
                      onClick={() => onDelete(m.id)}
                      title="Hapus / Sensor Pesan"
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <AdminEmptyState
                icon={<MessageSquare className="w-6 h-6" />}
                title="Tidak ada pesan donasi"
                description="Belum ada pesan donasi yang tercatat."
                colSpan={6}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
