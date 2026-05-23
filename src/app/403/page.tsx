import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "403 - Akses Ditolak | DonasiKu",
};

export default function ForbiddenPage() {
  return <AppErrorView code="403" />;
}
