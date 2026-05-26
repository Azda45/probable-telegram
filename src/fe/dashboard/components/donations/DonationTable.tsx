"use client";

import { useState } from "react";
import type { DonationRecord } from "@/shared/types/models";
import { formatRupiah, timeAgo } from "@/shared/utils";
import ReplayButton from "./ReplayButton";
import DonationPagination from "./DonationPagination";
import { Mail, Clock, MessageSquare, User, Eye, EyeOff } from "lucide-react";

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
}: DonationTableProps) {
  const [revealedEmails, setRevealedEmails] = useState<Set<string>>(new Set());
  const totalPages = Math.ceil(total / perPage);

  const toggleEmail = (id: string) => {
    setRevealedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {donations.length === 0 ? (
        <div className="card text-center py-12 text-[var(--color-text-muted)]">
          Belum ada donasi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {donations.map((donation) => {
            const isRevealed = revealedEmails.has(donation.id);
            return (
              <div key={donation.id} className="card p-5 flex flex-col gap-3 relative hover:border-[var(--color-primary)]/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                    <User size={16} className="text-violet-400" />
                    {donation.donor_name}
                  </div>
                  <div className="font-bold text-[var(--color-success)] bg-green-500/10 px-2 py-1 rounded-md text-sm whitespace-nowrap">
                    {formatRupiah(donation.amount)}
                  </div>
                </div>
                
                <div className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-2">
                  <Mail size={14} />
                  <span className="truncate flex-1" title={isRevealed ? (donation.donor_email || "") : "Sembunyikan Email"}>
                    {isRevealed ? (donation.donor_email || "-") : "•••••••••••••••••"}
                  </span>
                  <button 
                    onClick={() => toggleEmail(donation.id)} 
                    className="p-1 hover:text-[var(--color-text-primary)] transition-colors opacity-70 hover:opacity-100"
                    title={isRevealed ? "Sembunyikan" : "Tampilkan"}
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-2 mb-2">
                  <Clock size={14} />
                  {timeAgo(donation.created_at)}
                </div>

                <div 
                  className="flex-1 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)]/30 text-[var(--color-text-primary)] mt-1"
                  style={{ padding: '16px' }}
                >
                  <p className="line-clamp-3 overflow-hidden text-ellipsis break-words text-[15px] leading-relaxed">
                    {donation.message || <span className="italic opacity-50 text-[var(--color-text-muted)]">Tanpa pesan</span>}
                  </p>
                </div>

                {onReplay && PAID_STATUSES.has(donation.transaction_status) && (
                  <div className="mt-2 flex justify-end">
                    <ReplayButton donationId={donation.id} onReplay={onReplay} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {total > perPage && (
        <DonationPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
