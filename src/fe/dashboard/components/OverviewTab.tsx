import { Banknote, Eye, EyeOff } from "lucide-react";
import { formatRupiah } from "@/shared/utils";
import type { DonationStats } from "@/shared/types/legacy";

interface OverviewTabProps {
  stats: DonationStats;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export default function OverviewTab({ stats, showBalance, onToggleBalance }: OverviewTabProps) {
  return (
    <div>
      <div className="card mb-10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border-violet-500/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Banknote className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
            <Banknote className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-400/80 mb-1 uppercase tracking-wider">Total Pendapatan</p>
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-bold tracking-tight">
                {showBalance ? formatRupiah(stats.totalAmount) : "Rp ••••••••"}
              </h2>
              <button
                onClick={onToggleBalance}
                className="text-violet-400/60 hover:text-violet-400 transition-colors focus:outline-none"
                title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              >
                {showBalance ? <EyeOff className="w-7 h-7" /> : <Eye className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {stats.topDonors.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-5">🏆 Top Donors</h3>
          <div className="flex flex-col gap-3">
            {stats.topDonors.map((donor, index) => (
              <div key={`${donor.donor_name}-${donor.total}-${donor.count}`} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-surface-elevated)]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[13px] ${index === 0 ? "bg-gradient-to-br from-amber-500 to-amber-400 text-[#0f0f23]" :
                  index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-300 text-[#0f0f23]" :
                    index === 2 ? "bg-gradient-to-br from-amber-700 to-amber-600 text-[#0f0f23]" :
                      "bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
                  }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]">{donor.donor_name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{donor.count}x donasi</div>
                </div>
                <div className="font-bold text-[var(--color-success)]">{formatRupiah(donor.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
