import CopyLink from "@/components/CopyLink";
import Link from "next/link";
import { useState } from "react";
import { Bell, Eye, EyeOff, KeyRound, MonitorPlay, PauseCircle, PlayCircle, RefreshCw, SkipForward } from "lucide-react";

interface OverlayControlTabProps {
  controlUrl: string;
  pauseApiUrl: string;
  skipApiUrl: string;
  censorApiUrl: string;
  testApiUrl: string;
  refreshApiUrl: string;
  testingSend: boolean;
  isOverlayPaused: boolean;
  onTestOverlay: () => void;
  onRegenerate: () => void;
  onPauseOverlay: () => void;
  onSkipOverlay: () => void;
  onToggleCensorOverlay: () => Promise<boolean | undefined>;
  onRefreshOverlay: () => void;
}

export default function OverlayControlTab({
  controlUrl,
  pauseApiUrl,
  skipApiUrl,
  censorApiUrl,
  testApiUrl,
  refreshApiUrl,
  testingSend,
  isOverlayPaused,
  onTestOverlay,
  onRegenerate,
  onPauseOverlay,
  onSkipOverlay,
  onToggleCensorOverlay,
  onRefreshOverlay,
}: OverlayControlTabProps) {
  const [isCensored, setIsCensored] = useState(false);

  const handleToggleCensor = async () => {
    const nextCensored = await onToggleCensorOverlay();
    if (typeof nextCensored === "boolean") {
      setIsCensored(nextCensored);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-4 sm:p-6">
        <h3 className="text-lg font-bold mb-3">API & Remote Control</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          Berikut adalah <strong>URL HTTP GET</strong> yang bisa kamu pasang di <strong>Elgato Stream Deck</strong>, Touch Portal, atau <em>macro/hotkey</em> lainnya. 
          Setiap URL akan langsung mengeksekusi aksi terkait secara instan tanpa perlu proses login.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '1rem' }}>
          
          {/* Remote Control */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-border)] flex flex-col hover:border-[var(--color-primary)]/50 transition-all shadow-sm" style={{ padding: '1.25rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Remote Control (Web)</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Buka panel ini di HP/Tablet untuk mengontrol overlay secara nirkabel dari browser.
                </p>
              </div>
            </div>
            <CopyLink
              label="URL Web"
              url={controlUrl}
              actions={
                <Link href={controlUrl || "#"} target="_blank" rel="noopener noreferrer" prefetch={false} className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center" style={{ gap: '0.5rem' }}>
                  <MonitorPlay className="w-4 h-4" />
                  Buka Panel
                </Link>
              }
            />
          </div>

          {/* Pause / Resume */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-border)] flex flex-col hover:border-[var(--color-primary)]/50 transition-all shadow-sm" style={{ padding: '1.25rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-lg shrink-0">
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Pause & Resume</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Jeda notifikasi donasi yang berjalan, atau lanjutkan kembali antrean donasi.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={pauseApiUrl}
              actions={
                <button className={`btn btn-sm flex-1 sm:flex-none flex items-center justify-center ${isOverlayPaused ? "btn-primary" : "btn-secondary"}`} style={{ gap: '0.5rem' }} onClick={onPauseOverlay}>
                  {isOverlayPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                  {isOverlayPaused ? "Resume" : "Pause"}
                </button>
              }
            />
          </div>

          {/* Skip Notifikasi */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-border)] flex flex-col hover:border-[var(--color-primary)]/50 transition-all shadow-sm" style={{ padding: '1.25rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-lg shrink-0">
                <SkipForward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Skip Notifikasi</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Lompati donasi saat ini dan langsung tampilkan antrean donasi berikutnya.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={skipApiUrl}
              actions={
                <button type="button" className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center" style={{ gap: '0.5rem' }} onClick={onSkipOverlay}>
                  <SkipForward className="w-4 h-4" />
                  Trigger
                </button>
              }
            />
          </div>

          {/* Toggle Sensor */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-border)] flex flex-col hover:border-[var(--color-primary)]/50 transition-all shadow-sm" style={{ padding: '1.25rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Toggle Sensor Pesan</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Sensor atau tampilkan kembali pesan donasi di layar secara instan (anti toxic).
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={censorApiUrl}
              actions={
                <button
                  type="button"
                  className={`btn btn-sm flex-1 sm:flex-none flex items-center justify-center ${isCensored ? "btn-primary" : "btn-secondary"}`}
                  style={{ gap: '0.5rem' }}
                  onClick={handleToggleCensor}
                >
                  {isCensored ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {isCensored ? "Unsensor" : "Sensor"}
                </button>
              }
            />
          </div>

          {/* Test Notifikasi */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-border)] flex flex-col hover:border-[var(--color-primary)]/50 transition-all shadow-sm" style={{ padding: '1.25rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="p-2.5 bg-green-500/10 text-green-400 rounded-lg shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Test Notifikasi</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Kirim donasi simulasi/bohongan untuk menguji tampilan overlay di OBS.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={testApiUrl}
              actions={
                <button className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center" style={{ gap: '0.5rem' }} onClick={onTestOverlay} disabled={testingSend}>
                  <Bell className="w-4 h-4" />
                  {testingSend ? "Loading..." : "Trigger"}
                </button>
              }
            />
          </div>

          {/* Refresh Overlay */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-border)] flex flex-col hover:border-[var(--color-primary)]/50 transition-all shadow-sm" style={{ padding: '1.25rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Refresh Overlay</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Muat ulang otomatis sumber browser OBS jika terjadi lag atau freeze.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={refreshApiUrl}
              actions={
                <button
                  className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center"
                  style={{ gap: '0.5rem' }}
                  onClick={onRefreshOverlay}
                >
                  <RefreshCw className="w-4 h-4" />
                  Trigger
                </button>
              }
            />
          </div>

        </div>

        <div className="rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row items-center" style={{ padding: '1.25rem', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-danger w-full sm:w-auto flex items-center justify-center gap-2 shrink-0" onClick={onRegenerate}>
            <KeyRound className="w-4 h-4" />
            Regenerate Tokens
          </button>
          <p className="text-xs text-red-400/90 leading-relaxed">
            <strong>Peringatan!</strong> Melakukan aksi ini akan mengubah semua token API di atas (termasuk Link OBS). Kamu wajib memperbarui ulang semua link di Stream Deck dan OBS jika token diganti.
          </p>
        </div>

      </div>
    </div>
  );
}
