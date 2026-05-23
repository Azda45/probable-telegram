import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "405 - Aksi Tidak Tersedia | DonasiKu",
};

export default function MethodNotAllowedPage() {
  return <AppErrorView code="405" />;
}