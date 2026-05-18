"use client";

import { useState } from "react";
import { DonationRecord } from "@/lib/types";
import { formatRupiah, timeAgo } from "@/lib/utils";

interface DonationTableProps {
  donations: DonationRecord[];
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onReplay?: (donationId: string) => Promise<void>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: "badge-warning", label: "Menunggu" },
    settlement: { cls: "badge-success", label: "Berhasil" },
    capture: { cls: "badge-success", label: "Berhasil" },
    expire: { cls: "badge-danger", label: "Kadaluarsa" },
    cancel: { cls: "badge-danger", label: "Dibatalkan" },
    deny: { cls: "badge-danger", label: "Ditolak" },
    fraud: { cls: "badge-danger", label: "Fraud" },
  };
  const badge = map[status] || { cls: "badge-info", label: status };
  return <span className={`badge ${badge.cls}`}>{badge.label}</span>;
}

import { Play, Check } from "lucide-react";

function ReplayButton({ donationId, onReplay }: { donationId: string; onReplay: (id: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onReplay(donationId);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || done}
      title="Tampilkan ulang di overlay"
      className={`px-2 py-1 inline-flex items-center justify-center gap-1 min-w-[75px] rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
        done 
          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
          : "border border-violet-500/25 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
      } ${loading || done ? "cursor-default" : "cursor-pointer"}`}
    >
      {loading ? "..." : done ? (
        <><Check className="w-3 h-3" /> Sent</>
      ) : (
        <><Play className="w-3 h-3" /> Replay</>
      )}
    </button>
  );
}

export default function DonationTable({
  donations,
  page,
  total,
  perPage,
  onPageChange,
  onReplay,
}: DonationTableProps) {
  const totalPages = Math.ceil(total / perPage);
  const isPaid = (status: string) => ["settlement", "capture"].includes(status);

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
                <td
                  colSpan={onReplay ? 6 : 5}
                  className="text-center py-12 text-[var(--color-text-muted)]"
                >
                  Belum ada donasi
                </td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d.id}>
                  <td className="font-semibold text-[var(--color-text-primary)]">
                    {d.donor_name}
                  </td>
                  <td className="font-semibold text-[var(--color-success)]">
                    {formatRupiah(d.amount)}
                  </td>
                  <td className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {d.message || (
                      <span className="text-[var(--color-text-muted)] italic">
                        Tanpa pesan
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={d.transaction_status} />
                  </td>
                  <td className="whitespace-nowrap">
                    {timeAgo(d.created_at)}
                  </td>
                  {onReplay && (
                    <td>
                      {isPaid(d.transaction_status) && (
                        <ReplayButton donationId={d.id} onReplay={onReplay} />
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
        <div className="flex gap-2 justify-center mt-6">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Sebelumnya
          </button>
          <span className="px-4 py-2 text-[13px] text-[var(--color-text-muted)]">
            Halaman {page} dari {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
