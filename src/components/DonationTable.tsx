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
      style={{
        padding: "0.25rem 0.5rem",
        borderRadius: 6,
        border: done ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(139,92,246,0.25)",
        background: done ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.1)",
        color: done ? "#34d399" : "#a78bfa",
        fontSize: "0.75rem",
        fontWeight: 600,
        cursor: loading || done ? "default" : "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "..." : done ? "✓ Sent" : "🔄 Replay"}
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
              {onReplay && <th style={{ width: 80 }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td
                  colSpan={onReplay ? 6 : 5}
                  style={{
                    textAlign: "center",
                    padding: "3rem 1rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Belum ada donasi
                </td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d.id}>
                  <td
                    style={{
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {d.donor_name}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: "var(--color-success)",
                    }}
                  >
                    {formatRupiah(d.amount)}
                  </td>
                  <td
                    style={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.message || (
                      <span
                        style={{
                          color: "var(--color-text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Tanpa pesan
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={d.transaction_status} />
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
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
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Sebelumnya
          </button>
          <span
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
            }}
          >
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
