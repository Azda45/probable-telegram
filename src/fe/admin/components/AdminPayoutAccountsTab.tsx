"use client";

interface AdminPayoutAccountsTabProps {
  accounts: any[];
}

export default function AdminPayoutAccountsTab({ accounts }: AdminPayoutAccountsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">Payout Accounts</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Creator</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Bank Name</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Account Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {accounts.map((a) => (
              <tr key={a.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-primary)]">
                  @{a.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  {a.bank_name || <span className="text-[var(--color-text-muted)] italic">Not set</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  {a.bank_account || <span className="text-[var(--color-text-muted)] italic">Not set</span>}
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                  No creators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
