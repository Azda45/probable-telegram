"use client";

import { ShieldAlert } from "lucide-react";

interface AdminAdminsTabProps {
  admins: any[];
}

export default function AdminAdminsTab({ admins }: AdminAdminsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Authorized Administrators
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Name</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Username</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Email</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Role</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {a.display_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-primary)]">
                  @{a.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {a.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold uppercase">
                    Super Admin
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={async () => {
                      if (!confirm("Revoke admin access?")) return;
                      const res = await fetch(`/api/admin/users/${a.id}/admin`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ is_admin: false })
                      });
                      if (res.ok) window.location.reload();
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                  No administrators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
