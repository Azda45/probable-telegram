import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppErrorView, { type ErrorCode } from "@/components/AppErrorView";

const STATUS_CODES = ["400", "401", "403", "404", "405", "500", "503"] as const;

const TITLES: Record<ErrorCode, string> = {
  "400": "400 - Permintaan Tidak Valid | DonasiKu",
  "401": "401 - Login Dibutuhkan | DonasiKu",
  "403": "403 - Akses Ditolak | DonasiKu",
  "404": "404 - Halaman Tidak Ditemukan | DonasiKu",
  "405": "405 - Aksi Tidak Tersedia | DonasiKu",
  "500": "500 - Terjadi Kesalahan | DonasiKu",
  "503": "503 - Layanan Tidak Tersedia | DonasiKu",
};

function isErrorCode(code: string): code is ErrorCode {
  return STATUS_CODES.includes(code as ErrorCode);
}

export function generateStaticParams() {
  return STATUS_CODES.map((code) => ({ code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: isErrorCode(code) ? TITLES[code] : "Status Tidak Dikenal | DonasiKu",
  };
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!isErrorCode(code)) {
    notFound();
  }

  return <AppErrorView code={code} />;
}
