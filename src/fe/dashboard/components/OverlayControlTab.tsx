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
        <h3 className="text-lg font-bold mb-4">Overlay Control</h3>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Berikut adalah URL API *HTTP GET* yang bisa kamu *copy* dan pasang di **Elgato Stream Deck** atau *macro/hotkey* lainnya. 
          Setiap kali URL ini diakses (GET request), aksi akan langsung dijalankan tanpa perlu login.
        </p>

        <div className="space-y-4">
          
          <div className="bg-black/10 dark:bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 relative transition-colors hover:border-[var(--color-primary)]/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 mt-1 sm:mt-0">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Remote Control (Web)</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Buka link ini di HP/Tablet untuk mengontrol overlay lewat browser tanpa aplikasi tambahan.
                </p>
              </div>
            </div>
            <CopyLink
              label="URL Web"
              url={controlUrl}
              actions={
                <Link href={controlUrl || "#"} target="_blank" rel="noopener noreferrer" prefetch={false} className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[90px]">
                  <MonitorPlay className="w-4 h-4" />
                  Buka
                </Link>
              }
            />
          </div>

          <div className="bg-black/10 dark:bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 relative transition-colors hover:border-[var(--color-primary)]/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg shrink-0 mt-1 sm:mt-0">
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Pause / Resume</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Jeda notifikasi donasi yang sedang berjalan, atau lanjutkan kembali antrean donasi.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={pauseApiUrl}
              actions={
                <button className={`btn btn-sm flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[100px] ${isOverlayPaused ? "btn-primary" : "btn-secondary"}`} onClick={onPauseOverlay}>
                  {isOverlayPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                  {isOverlayPaused ? "Resume" : "Pause"}
                </button>
              }
            />
          </div>

          <div className="bg-black/10 dark:bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 relative transition-colors hover:border-[var(--color-primary)]/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg shrink-0 mt-1 sm:mt-0">
                <SkipForward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Skip Notifikasi</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Lompati notifikasi donasi yang sedang tampil saat ini dan lanjut ke donasi berikutnya.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={skipApiUrl}
              actions={
                <button type="button" className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[100px]" onClick={onSkipOverlay}>
                  <SkipForward className="w-4 h-4" />
                  Trigger
                </button>
              }
            />
          </div>

          <div className="bg-black/10 dark:bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 relative transition-colors hover:border-[var(--color-primary)]/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg shrink-0 mt-1 sm:mt-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Toggle Sensor Pesan</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Sembunyikan atau tampilkan pesan donasi di layar secara instan (berguna jika ada pesan toxic).
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={censorApiUrl}
              actions={
                <button
                  type="button"
                  className={`btn btn-sm flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[100px] ${isCensored ? "btn-primary" : "btn-secondary"}`}
                  onClick={handleToggleCensor}
                >
                  {isCensored ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {isCensored ? "Unsensor" : "Sensor"}
                </button>
              }
            />
          </div>

          <div className="bg-black/10 dark:bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 relative transition-colors hover:border-[var(--color-primary)]/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg shrink-0 mt-1 sm:mt-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Test Notifikasi</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Kirim notifikasi donasi bohongan ke layar untuk mengecek tampilan overlay.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={testApiUrl}
              actions={
                <button className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[100px]" onClick={onTestOverlay} disabled={testingSend}>
                  <Bell className="w-4 h-4" />
                  {testingSend ? "Sending..." : "Trigger"}
                </button>
              }
            />
          </div>

          <div className="bg-black/10 dark:bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 relative transition-colors hover:border-[var(--color-primary)]/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg shrink-0 mt-1 sm:mt-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Refresh Overlay</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Muat ulang halaman overlay di OBS jika terjadi error, nge-freeze, atau nge-lag.
                </p>
              </div>
            </div>
            <CopyLink
              label="API URL (GET)"
              url={refreshApiUrl}
              actions={
                <button
                  className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[100px]"
                  onClick={onRefreshOverlay}
                >
                  <RefreshCw className="w-4 h-4" />
                  Trigger
                </button>
              }
            />
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button className="btn btn-danger w-full sm:w-auto flex items-center justify-center gap-2 whitespace-nowrap" onClick={onRegenerate}>
              <KeyRound className="w-4 h-4" />
              Regenerate Token
            </button>
            <p className="text-xs text-[var(--color-text-secondary)]">
              <strong>Awas!</strong> Melakukan regenerate akan mengubah semua token di atas (termasuk link OBS di Quick Links). Update semua link di Stream Deck dan OBS jika token diganti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
