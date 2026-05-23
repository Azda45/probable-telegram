"use client";

interface AdminAuditLogsTabProps {
  logs: any[];
}

export default function AdminAuditLogsTab({ logs }: AdminAuditLogsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">System Audit Logs</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Time</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Admin</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Action</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-primary)]">
                  @{log.admin_username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-bold font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] break-words">
                  {log.details}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                  No logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
