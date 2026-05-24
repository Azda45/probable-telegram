"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  creators: "Creator",
  all: "Semua",
  suspended: "Suspended",
  "payout-accounts": "Akun Payout",
  transactions: "Transaksi",
  pending: "Pending",
  success: "Sukses",
  failed: "Gagal",
  refund: "Refund",
  payouts: "Penarikan",
  requests: "Permintaan",
  history: "Riwayat",
  balances: "Saldo",
  moderation: "Moderasi",
  messages: "Pesan",
  reports: "Laporan",
  blacklist: "Kata Terlarang",
  overlay: "Overlay",
  settings: "Pengaturan",
  platform: "Platform",
  logs: "Log",
  audit: "Audit",
  admins: "Admin",
  users: "Pengguna",
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);
  // Remove 'admin' prefix for display, keep for links
  const crumbs = segments.slice(1); // skip 'admin'

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link
        href="/admin/dashboard"
        className="text-[var(--color-text-muted)] hover:text-white transition-colors"
      >
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, i) => {
        const href = "/" + segments.slice(0, i + 2).join("/");
        const isLast = i === crumbs.length - 1;
        const label = labelMap[crumb] || crumb.charAt(0).toUpperCase() + crumb.slice(1);

        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-[var(--color-text-muted)]/40" />
            {isLast ? (
              <span className="text-white font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
