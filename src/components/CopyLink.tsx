"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";

interface CopyLinkProps {
  label: string;
  url: string;
  actions?: React.ReactNode;
}

export default function CopyLink({ label, url, actions }: CopyLinkProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} berhasil disalin!`);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row" style={{ gap: '0.5rem' }}>
        <input
          readOnly
          value={url}
          className="input h-9 text-[13px] bg-[var(--color-surface)] border-dashed flex-1"
        />
        <div className="flex shrink-0" style={{ gap: '0.5rem' }}>
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center"
            style={{ gap: '0.5rem' }}
          >
            <Copy className="w-4 h-4" />
            Salin
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}
