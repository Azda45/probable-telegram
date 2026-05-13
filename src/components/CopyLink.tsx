"use client";

import { showToast } from "./Toast";

interface CopyLinkProps {
  label: string;
  url: string;
}

export default function CopyLink({ label, url }: CopyLinkProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    showToast("success", `${label} berhasil disalin!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input 
          readOnly 
          value={url} 
          className="input" 
          style={{ height: 36, fontSize: "0.8125rem", background: "var(--color-surface)", borderStyle: "dashed" }} 
        />
        <button 
          onClick={handleCopy}
          className="btn btn-secondary btn-sm"
          style={{ height: 36, padding: "0 1rem", flexShrink: 0 }}
        >
          Salin
        </button>
      </div>
    </div>
  );
}
