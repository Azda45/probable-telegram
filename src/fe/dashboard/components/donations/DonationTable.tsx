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
}

const PAID_STATUSES = new Set(["settlement", "capture"]);

export default function DonationTable({
  donations,
  page,
  total,
  perPage,
  onPageChange,
  onReplay,
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
              {onReplay && <th className="w-20">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={onReplay ? 6 : 5} className="text-center py-12 text-[var(--color-text-muted)]">
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
                  {onReplay && (
                    <td>
                      {PAID_STATUSES.has(donation.transaction_status) && (
                        <ReplayButton donationId={donation.id} onReplay={onReplay} />
                      )}
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
