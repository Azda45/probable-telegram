import { redirect } from "next/navigation";
import { getAuthUser } from "@/be/auth";
import AdminSidebar from "@/fe/admin/components/AdminSidebar";
import AdminBreadcrumb from "@/fe/admin/components/AdminBreadcrumb";
import { Toaster } from "sonner";

export const metadata = {
  title: "Admin Panel | DonasiKu",
  description: "Platform Administration",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.is_admin) {
    redirect("/dashboard"); // Redirect normal users away
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          },
        }}
        richColors
      />
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="pl-10 lg:pl-0">
            <AdminBreadcrumb />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-muted)] hidden sm:inline">
              Login sebagai <span className="text-white font-medium">@{user.username}</span>
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
