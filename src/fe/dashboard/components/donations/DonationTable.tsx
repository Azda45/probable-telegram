import type { DonationRecord } from "@/shared/types/models";
import { formatRupiah, timeAgo } from "@/shared/utils";
import StatusBadge from "./StatusBadge";
import ReplayButton from "./ReplayButton";
import DonationPagination from "./DonationPagination";

interface DonationTableProps {
  donations: DonationRecord[];
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onReplay?: (donationId: string) => Promise<void>;
  onDelete?: (donationId: string) => Promise<void>;
}

const PAID_STATUSES = new Set(["settlement", "capture"]);

export default function DonationTable({
  donations,
  page,
  total,
  perPage,
  onPageChange,
  onReplay,
  onDelete,
}: DonationTableProps) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Donatur</th>
              <th>Jumlah</th>
              <th>Pesan</th>
              <th>Status</th>
              <th>Waktu</th>
              {(onReplay || onDelete) && <th className="w-20 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={(onReplay || onDelete) ? 6 : 5} className="text-center py-12 text-[var(--color-text-muted)]">
                  Belum ada donasi
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="font-semibold text-[var(--color-text-primary)]">{donation.donor_name}</td>
                  <td className="font-semibold text-[var(--color-success)]">{formatRupiah(donation.amount)}</td>
                  <td className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {donation.message || <span className="text-[var(--color-text-muted)] italic">Tanpa pesan</span>}
                  </td>
                  <td><StatusBadge status={donation.transaction_status} /></td>
                  <td className="whitespace-nowrap">{timeAgo(donation.created_at)}</td>
                  {(onReplay || onDelete) && (
                    <td>
                      <div className="flex items-center gap-2 justify-center">
                        {onReplay && PAID_STATUSES.has(donation.transaction_status) && (
                          <ReplayButton donationId={donation.id} onReplay={onReplay} />
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(donation.id)}
                            className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Hapus / Censor Pesan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <DonationPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
