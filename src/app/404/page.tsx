import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | DonasiKu",
};

export default function NotFoundPreviewPage() {
  return <AppErrorView code="404" />;
}
