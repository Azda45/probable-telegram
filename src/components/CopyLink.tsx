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
      <input
        readOnly
        value={url}
        className="input h-9 text-[13px] bg-[var(--color-surface)] border-dashed"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={handleCopy}
          className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[100px]"
        >
          <Copy className="w-4 h-4" />
          Salin
        </button>
        {actions}
      </div>
    </div>
  );
}
