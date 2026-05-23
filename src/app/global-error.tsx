"use client";

import { useEffect } from "react";
import "./globals.css";
import AppErrorView from "@/components/AppErrorView";

export default function GlobalError({
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
    <html lang="id" className="dark">
      <body>
        <title>500 - Terjadi Kesalahan | DonasiKu</title>
        <AppErrorView
          code="500"
          detail={error.digest ? `Kode referensi: ${error.digest}` : null}
          onRetry={unstable_retry}
        />
      </body>
    </html>
  );
}
