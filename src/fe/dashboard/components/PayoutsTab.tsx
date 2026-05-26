"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";

interface PayoutsTabProps {
  balance: number;
}

export default function PayoutsTab({ balance }: PayoutsTabProps) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetch("/api/user/withdrawals")
      .then(res => res.json())
      .then(data => {
        if (data.withdrawals) setWithdrawals(data.withdrawals);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    if (!confirm("Ajukan penarikan dana untuk seluruh saldo Anda? Pastikan rekening sudah diatur di Settings.")) return;
    setRequesting(true);
    try {
      const res = await fetch("/api/user/withdrawals", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Penarikan berhasil diajukan!");
        window.location.reload();
      } else {
        alert(data.error || "Gagal mengajukan penarikan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-[var(--color-surface)] rounded-2xl"></div>;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-[var(--color-text-muted)]">Saldo Tersedia</h2>
          <div className="text-3xl font-bold text-green-400 mt-1">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(balance)}
          </div>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={balance <= 0 || requesting}
          className="btn shrink-0 bg-green-500 hover:bg-green-600 shadow-lg shadow-[var(--color-success)]/20 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowUpRight size={18} />
          {requesting ? "Memproses..." : "Cairkan Dana"}
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold text-lg">Riwayat Penarikan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-hover)]">
                <th className="px-6 py-3 font-semibold text-[var(--color-text-muted)]">Tanggal</th>
                <th className="px-6 py-3 font-semibold text-[var(--color-text-muted)]">Jumlah</th>
                <th className="px-6 py-3 font-semibold text-[var(--color-text-muted)]">Tujuan</th>
                <th className="px-6 py-3 font-semibold text-[var(--color-text-muted)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-[var(--color-surface-hover)]/50">
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-muted)]">
                    {new Date(w.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(w.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-muted)]">
                    {w.bank_name} - {w.bank_account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {w.status === 'pending' ? (
                      <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 w-max px-2.5 py-1 rounded-lg text-xs font-bold">
                        <Clock size={14} /> Pending
                      </span>
                    ) : w.status === 'approved' ? (
                      <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 w-max px-2.5 py-1 rounded-lg text-xs font-bold">
                        <CheckCircle size={14} /> Berhasil
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 bg-red-500/10 w-max px-2.5 py-1 rounded-lg text-xs font-bold">
                        <XCircle size={14} /> Ditolak
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                    Belum ada riwayat penarikan dana.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
