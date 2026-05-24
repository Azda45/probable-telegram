"use client";

import AdminEmptyState from "./AdminEmptyState";
import { Users } from "lucide-react";

interface AdminUsersTabProps {
  users: any[];
  onToggleBan: (userId: string, isBanned: boolean) => void;
  onViewDetails: (user: any) => void;
  onToggleAdmin?: (userId: string, isAdmin: boolean) => void;
}

export default function AdminUsersTab({ users, onToggleBan, onViewDetails, onToggleAdmin }: AdminUsersTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">Daftar Streamer</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Username</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Email</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Total Diterima</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map((u) => {
              const isBanned = u.banned_at !== null || u.is_active === 0;
              return (
                <tr key={u.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium cursor-pointer text-[var(--color-primary)] hover:underline" onClick={() => onViewDetails(u)}>
                    {u.username}
                    {u.is_admin ? <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full no-underline">Admin</span> : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-muted)]">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    Rp {Number(u.total_received || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isBanned ? (
                      <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-medium">Banned</span>
                    ) : (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-medium">Aktif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    {!u.is_admin && (
                      <button
                        onClick={() => onToggleBan(u.id, isBanned)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isBanned 
                            ? "bg-[var(--color-surface-hover)] hover:bg-green-500/20 text-[var(--color-text-muted)] hover:text-green-500 border border-[var(--color-border)]"
                            : "bg-red-500/10 hover:bg-red-500/20 text-red-500"
                        }`}
                      >
                        {isBanned ? "Buka Ban" : "Ban"}
                      </button>
                    )}
                    <button
                      onClick={() => onToggleAdmin && onToggleAdmin(u.id, !!u.is_admin)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        u.is_admin 
                          ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                          : "bg-[var(--color-surface-hover)] hover:bg-yellow-500/20 text-[var(--color-text-muted)] hover:text-yellow-500 border border-[var(--color-border)]"
                      }`}
                    >
                      {u.is_admin ? "Cabut Admin" : "Jadikan Admin"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <AdminEmptyState
                icon={<Users className="w-6 h-6" />}
                title="Tidak ada pengguna"
                description="Belum ada pengguna yang terdaftar."
                colSpan={5}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
