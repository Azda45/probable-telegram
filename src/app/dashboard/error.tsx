"use client";

import { useEffect } from "react";
import AppErrorView from "@/components/AppErrorView";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppErrorView
      code="500"
      title="Dashboard gagal dimuat"
      message="Data dashboard tidak bisa ditampilkan saat ini. Coba muat ulang halaman."
      detail={error.digest ? `Kode referensi: ${error.digest}` : null}
      onRetry={unstable_retry}
    />
  );
}
