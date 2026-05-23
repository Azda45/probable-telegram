import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "400 - Permintaan Tidak Valid | DonasiKu",
};

export default function BadRequestPage() {
  return <AppErrorView code="400" />;
}
