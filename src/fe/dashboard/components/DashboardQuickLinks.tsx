import CopyLink from "@/components/CopyLink";
import Link from "next/link";
import { ExternalLink, MonitorPlay } from "lucide-react";

interface DashboardQuickLinksProps {
  donateUrl: string;
  overlayUrl: string;
}

export default function DashboardQuickLinks({ donateUrl, overlayUrl }: DashboardQuickLinksProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" style={{ gap: "1rem", marginBottom: "2rem" }}>
      <div className="card p-4 sm:p-5">
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
      <div className="card p-4 sm:p-5">
        <CopyLink
          label="URL Overlay (OBS)"
          url={overlayUrl}
          actions={
            <Link href={overlayUrl || "#"} target="_blank" rel="noopener noreferrer" prefetch={false} className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[90px]">
              <MonitorPlay className="w-4 h-4" />
              Buka
            </Link>
          }
        />
      </div>
    </div>
  );
}
