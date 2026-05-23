import { redirect } from "next/navigation";
import { getAuthUser } from "@/be/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
