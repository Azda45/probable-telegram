import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | DonasiKu",
  description: "Halaman yang kamu buka tidak ditemukan.",
};

export default function NotFound() {
  return <AppErrorView code="404" />;
}
