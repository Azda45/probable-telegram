"use client";

interface AdminPayoutsTabProps {
  payouts: any[];
  title: string;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function AdminPayoutsTab({ payouts, title, showActions = false, onApprove, onReject }: AdminPayoutsTabProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Creator</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Bank Details</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
              {showActions && <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {new Date(p.created_at).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-primary)]">
                  @{p.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">
                  Rp {Number(p.amount).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-semibold">{p.bank_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.bank_account}</p>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {p.status === 'approved' ? (
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">Approved</span>
                  ) : p.status === 'rejected' ? (
                    <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>
                  ) : (
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>
                  )}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => onApprove && onApprove(p.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 mr-2 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => onReject && onReject(p.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                  No payout requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
