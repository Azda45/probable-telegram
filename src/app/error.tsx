"use client";

import { useEffect } from "react";
import AppErrorView from "@/components/AppErrorView";

export default function Error({
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
      detail={error.digest ? `Kode referensi: ${error.digest}` : null}
      onRetry={unstable_retry}
    />
  );
}
