"use client";

import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  colSpan?: number;
}

export default function AdminEmptyState({
  icon,
  title = "Tidak ada data",
  description = "Belum ada data yang bisa ditampilkan.",
  colSpan = 5,
}: AdminEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
            {icon || <Inbox className="w-6 h-6" />}
          </div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
          <p className="text-xs text-[var(--color-text-muted)]/60">{description}</p>
        </div>
      </td>
    </tr>
  );
}
