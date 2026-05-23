import type { Metadata } from "next";
import AppErrorView from "@/components/AppErrorView";

export const metadata: Metadata = {
  title: "401 - Login Dibutuhkan | DonasiKu",
};

export default function UnauthorizedPage() {
  return <AppErrorView code="401" />;
}
