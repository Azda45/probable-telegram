"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserX, 
  CreditCard, 
  Receipt, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCcw,
  Landmark,
  Wallet,
  Activity,
  MessageSquare,
  Flag,
  FileText,
  ShieldAlert,
  Settings,
  Monitor,
  Database,
  Menu,
  X
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  exact?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, label, exact = false, onClick }: NavItemProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : (pathname?.startsWith(href) ?? false);
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/10" 
          : "text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

function NavGroup({ title, children }: NavGroupProps) {
  return (
    <div className="mb-6">
      <h4 className="px-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]/50 mb-2">
        {title}
      </h4>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      <div className="p-6">
        <Link href="/admin/dashboard" className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldAlert size={18} className="text-white" />
          </div>
          SuperAdmin.
        </Link>
      </div>

      <div className="flex-1 px-4 pb-8">
        <NavGroup title="Utama">
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" exact onClick={closeMobile} />
        </NavGroup>

        <NavGroup title="Creator">
          <NavItem href="/admin/creators/all" icon={Users} label="Semua Creator" onClick={closeMobile} />
          <NavItem href="/admin/creators/suspended" icon={UserX} label="Creator Suspended" onClick={closeMobile} />
          <NavItem href="/admin/creators/payout-accounts" icon={Landmark} label="Akun Payout" onClick={closeMobile} />
        </NavGroup>

        <NavGroup title="Transaksi">
          <NavItem href="/admin/transactions/all" icon={Receipt} label="Semua Donasi" exact onClick={closeMobile} />
          <NavItem href="/admin/transactions/pending" icon={Clock} label="Pending" exact onClick={closeMobile} />
          <NavItem href="/admin/transactions/success" icon={CheckCircle} label="Sukses" exact onClick={closeMobile} />
          <NavItem href="/admin/transactions/failed" icon={XCircle} label="Gagal" exact onClick={closeMobile} />
          <NavItem href="/admin/transactions/refund" icon={RefreshCcw} label="Refund / Dispute" exact onClick={closeMobile} />
        </NavGroup>

        <NavGroup title="Penarikan">
          <NavItem href="/admin/payouts/requests" icon={Wallet} label="Permintaan Tarik Dana" onClick={closeMobile} />
          <NavItem href="/admin/payouts/history" icon={Activity} label="Riwayat Penarikan" onClick={closeMobile} />
          <NavItem href="/admin/payouts/balances" icon={CreditCard} label="Saldo Creator" onClick={closeMobile} />
        </NavGroup>

        <NavGroup title="Moderasi">
          <NavItem href="/admin/moderation/messages" icon={MessageSquare} label="Pesan Donasi" onClick={closeMobile} />
          <NavItem href="/admin/moderation/reports" icon={Flag} label="Laporan" onClick={closeMobile} />
          <NavItem href="/admin/moderation/blacklist" icon={FileText} label="Kata Terlarang" onClick={closeMobile} />
        </NavGroup>

        <NavGroup title="Sistem">
          <NavItem href="/admin/overlay/creators" icon={Monitor} label="Kelola Overlay" onClick={closeMobile} />
          <NavItem href="/admin/settings/platform" icon={Settings} label="Pengaturan Global" onClick={closeMobile} />
          <NavItem href="/admin/logs/audit" icon={Database} label="Log Audit" onClick={closeMobile} />
        </NavGroup>

        <NavGroup title="Administrator">
          <NavItem href="/admin/admins/users" icon={ShieldAlert} label="Daftar Admin" onClick={closeMobile} />
        </NavGroup>
      </div>
      
      <div className="p-4 border-t border-[var(--color-border)] mt-auto">
        <Link 
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-surface-hover)] text-white hover:bg-slate-700 transition-colors"
        >
          Keluar dari Admin
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in */}
      <aside className={`
        w-64 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col fixed left-0 top-0 overflow-y-auto z-[56] hide-scrollbar transition-transform duration-300
        lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <X size={18} />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
