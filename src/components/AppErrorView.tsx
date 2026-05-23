"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Home,
  LogIn,
  RefreshCw,
  SearchX,
  ServerCrash,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import type { ComponentType } from "react";

export type ErrorCode = "400" | "401" | "403" | "404" | "405" | "500" | "503";

type ErrorCopy = {
  label: string;
  title: string;
  message: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  icon: ComponentType<{ className?: string }>;
};

const ERROR_COPY: Record<ErrorCode, ErrorCopy> = {
  "400": {
    label: "Bad Request",
    title: "Permintaan tidak valid",
    message: "Data atau alamat yang dikirim tidak bisa diproses. Periksa kembali input atau URL yang digunakan.",
    primaryHref: "/",
    primaryLabel: "Ke Beranda",
    icon: AlertTriangle,
  },
  "401": {
    label: "Unauthorized",
    title: "Login dibutuhkan",
    message: "Sesi belum aktif atau sudah berakhir. Masuk lagi untuk melanjutkan ke area akun.",
    primaryHref: "/login",
    primaryLabel: "Masuk",
    secondaryHref: "/",
    secondaryLabel: "Ke Beranda",
    icon: LogIn,
  },
  "403": {
    label: "Forbidden",
    title: "Akses ditolak",
    message: "Akun ini tidak punya izin untuk membuka halaman atau aksi tersebut.",
    primaryHref: "/dashboard",
    primaryLabel: "Ke Dashboard",
    secondaryHref: "/",
    secondaryLabel: "Ke Beranda",
    icon: ShieldAlert,
  },
  "404": {
    label: "Not Found",
    title: "Halaman tidak ditemukan",
    message: "Link ini sudah berubah, salah ketik, atau tidak pernah tersedia di DonasiKu.",
    primaryHref: "/",
    primaryLabel: "Ke Beranda",
    icon: SearchX,
  },
  "405": {
    label: "Method Not Allowed",
    title: "Aksi tidak tersedia",
    message: "Alamat API ini tidak bisa dibuka langsung dari browser. Gunakan halaman aplikasi yang sesuai untuk menjalankan aksi tersebut.",
    primaryHref: "/",
    primaryLabel: "Ke Beranda",
    icon: ShieldAlert,
  },
  "500": {
    label: "Server Error",
    title: "Terjadi kesalahan",
    message: "Server gagal memproses permintaan. Coba lagi, atau kembali ke halaman utama.",
    primaryHref: "/",
    primaryLabel: "Ke Beranda",
    icon: ServerCrash,
  },
  "503": {
    label: "Unavailable",
    title: "Layanan sementara tidak tersedia",
    message: "Sistem sedang tidak siap menerima permintaan. Tunggu sebentar lalu coba lagi.",
    primaryHref: "/",
    primaryLabel: "Ke Beranda",
    icon: WifiOff,
  },
};

interface AppErrorViewProps {
  code: ErrorCode;
  title?: string;
  message?: string;
  detail?: string | null;
  onRetry?: () => void;
}

export default function AppErrorView({
  code,
  title,
  message,
  detail,
  onRetry,
}: AppErrorViewProps) {
  const copy = ERROR_COPY[code];
  const Icon = copy.icon;
  const PrimaryIcon = code === "401" ? LogIn : Home;
  const secondaryHref = onRetry ? copy.primaryHref : copy.secondaryHref;
  const secondaryLabel = onRetry ? copy.primaryLabel : copy.secondaryLabel;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4 py-12 text-[var(--color-text-primary)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.16),transparent_36%),radial-gradient(circle_at_85%_90%,rgba(6,182,212,0.1),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

      <section
        aria-labelledby="error-title"
        className="relative w-full max-w-lg text-center"
      >
        <div className="absolute -inset-10 rounded-full bg-violet-500/10 blur-3xl" />

        <div
          className="relative rounded-[28px] border border-white/10 bg-slate-950/78 shadow-2xl shadow-black/25 backdrop-blur"
          style={{ padding: "72px clamp(24px, 6vw, 48px) 56px" }}
        >
          <div className="mb-7 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-400/10 text-[var(--color-primary-light)] shadow-lg shadow-violet-950/20">
              <Icon className="h-7 w-7" />
            </div>
          </div>

          <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {code} · {copy.label}
          </div>

          <p className="mb-5 text-6xl font-black leading-none tracking-[-0.06em] text-white sm:text-7xl">
            {code}
          </p>

          <h1
            id="error-title"
            className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            {title || copy.title}
          </h1>

          <p className="mx-auto mb-9 max-w-md text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
            {message || copy.message}
          </p>

          {detail && (
            <div className="mb-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 text-left">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Detail
              </p>
              <p className="break-all text-sm text-[var(--color-text-secondary)]">
                {detail}
              </p>
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-primary w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </button>
            ) : (
              <Link href={copy.primaryHref} className="btn btn-primary w-full sm:w-auto">
                <PrimaryIcon className="h-4 w-4" />
                {copy.primaryLabel}
              </Link>
            )}

            {secondaryHref && secondaryLabel && (
              <Link href={secondaryHref} className="btn btn-secondary w-full sm:w-auto">
                <Home className="h-4 w-4" />
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
