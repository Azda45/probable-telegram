import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "503 - Layanan Tidak Tersedia | DonasiKu",
};

export default function ServiceUnavailablePage() {
  return <AppErrorView code="503" />;
}
