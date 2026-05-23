import CopyLink from "@/components/CopyLink";
import Link from "next/link";
import { Bell, ExternalLink, KeyRound, MonitorPlay, PauseCircle, PlayCircle, SkipForward } from "lucide-react";

interface DashboardQuickLinksProps {
  donateUrl: string;
  overlayUrl: string;
  testingSend: boolean;
  isOverlayPaused: boolean;
  onTestOverlay: () => void;
  onRegenerate: () => void;
  onPauseOverlay: () => void;
  onSkipOverlay: () => void;
}

export default function DashboardQuickLinks({
  donateUrl,
  overlayUrl,
  testingSend,
  isOverlayPaused,
  onTestOverlay,
  onRegenerate,
  onPauseOverlay,
  onSkipOverlay,
}: DashboardQuickLinksProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ gap: "1rem", marginBottom: "2rem" }}>
      <div className="card p-4 sm:p-5 md:col-span-1">
        <CopyLink
          label="Link Donasi"
          url={donateUrl}
          actions={
            <Link href={donateUrl} target="_blank" rel="noopener noreferrer" prefetch={false} className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[100px]">
              <ExternalLink className="w-4 h-4" />
              Buka
            </Link>
          }
        />
      </div>
      <div className="card p-4 sm:p-5 md:col-span-2">
        <CopyLink
          label="URL Overlay"
          url={overlayUrl}
          actions={
            <>
              {/* Baris 1: aksi utama */}
              <Link href={overlayUrl || "#"} target="_blank" rel="noopener noreferrer" prefetch={false} className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[90px]">
                <MonitorPlay className="w-4 h-4" />
                Overlay
              </Link>
              <button className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[80px]" onClick={onTestOverlay} disabled={testingSend}>
                <Bell className="w-4 h-4" />
                {testingSend ? "Sending..." : "Tes"}
              </button>
              {/* Baris 2: kontrol overlay */}
              <button className={`btn btn-sm flex-1 flex items-center justify-center gap-2 min-w-[80px] ${isOverlayPaused ? "btn-primary" : "btn-secondary"}`} onClick={onPauseOverlay}>
                {isOverlayPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                {isOverlayPaused ? "Resume" : "Pause"}
              </button>
              <button type="button" className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[70px]" onClick={onSkipOverlay}>
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
              <button className="btn btn-danger btn-sm flex-1 flex items-center justify-center gap-2 min-w-[80px]" onClick={onRegenerate}>
                <KeyRound className="w-4 h-4" />
                Regen
              </button>
            </>
          }
        />
      </div>
    </div>
  );
}
