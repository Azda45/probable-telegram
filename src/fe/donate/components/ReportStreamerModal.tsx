"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface ReportStreamerModalProps {
  userId: string;
  onClose: () => void;
}

export default function ReportStreamerModal({ userId, onClose }: ReportStreamerModalProps) {
  const [reason, setReason] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan harus diisi.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_user_id: userId,
          reporter_name: reporterName.trim() || undefined,
          reason: reason.trim(),
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melaporkan streamer.");
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" /> Laporkan Streamer
          </h3>
          <button onClick={onClose} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {success ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-bold text-lg">Laporan Terkirim</h4>
            <p className="text-[var(--color-text-muted)] text-sm">Terima kasih atas laporannya. Kami akan segera menindaklanjuti laporan Anda.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)]">Nama Anda (Opsional)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Anonim jika dikosongkan"
                className="w-full px-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-white placeholder-[var(--color-text-muted)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)]">Alasan Laporan <span className="text-red-500">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan alasan Anda melaporkan streamer ini..."
                required
                rows={4}
                className="w-full px-4 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-white placeholder-[var(--color-text-muted)] resize-none"
                style={{ resize: 'none' }}
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {submitting ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
