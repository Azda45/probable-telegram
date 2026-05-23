"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Database
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  
  const NavItem = ({ href, icon: Icon, label, exact = false }: any) => {
    const active = exact ? pathname === href : (pathname?.startsWith(href) ?? false);
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active 
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
            : "text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)]"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  const NavGroup = ({ title, children }: any) => (
    <div className="mb-6">
      <h4 className="px-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]/50 mb-2">
        {title}
      </h4>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <aside className="w-64 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col fixed left-0 top-0 overflow-y-auto z-50 hide-scrollbar">
      <div className="p-6">
        <Link href="/admin/dashboard" className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <ShieldAlert size={18} className="text-white" />
          </div>
          SuperAdmin.
        </Link>
      </div>

      <div className="flex-1 px-4 pb-8">
        <NavGroup title="Main">
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" exact />
        </NavGroup>

        <NavGroup title="Creators">
          <NavItem href="/admin/creators/all" icon={Users} label="Semua Creator" />
          <NavItem href="/admin/creators/suspended" icon={UserX} label="Suspended Creator" />
          <NavItem href="/admin/creators/payout-accounts" icon={Landmark} label="Payout Account" />
        </NavGroup>

        <NavGroup title="Transactions">
          <NavItem href="/admin/transactions/all" icon={Receipt} label="Semua Donasi" exact />
          <NavItem href="/admin/transactions/pending" icon={Clock} label="Pending" exact />
          <NavItem href="/admin/transactions/success" icon={CheckCircle} label="Success" exact />
          <NavItem href="/admin/transactions/failed" icon={XCircle} label="Failed" exact />
          <NavItem href="/admin/transactions/refund" icon={RefreshCcw} label="Refund / Dispute" exact />
        </NavGroup>

        <NavGroup title="Payouts">
          <NavItem href="/admin/payouts/requests" icon={Wallet} label="Request Withdraw" />
          <NavItem href="/admin/payouts/history" icon={Activity} label="Riwayat Withdraw" />
          <NavItem href="/admin/payouts/balances" icon={CreditCard} label="Saldo Creator" />
        </NavGroup>

        <NavGroup title="Moderation">
          <NavItem href="/admin/moderation/messages" icon={MessageSquare} label="Pesan Donasi" />
          <NavItem href="/admin/moderation/reports" icon={Flag} label="Reports" />
          <NavItem href="/admin/moderation/blacklist" icon={FileText} label="Blacklist Words" />
        </NavGroup>

        <NavGroup title="System">
          <NavItem href="/admin/overlay/creators" icon={Monitor} label="Overlay Management" />
          <NavItem href="/admin/settings/platform" icon={Settings} label="Global Settings" />
          <NavItem href="/admin/logs/audit" icon={Database} label="Audit Log" />
        </NavGroup>

        <NavGroup title="Admins">
          <NavItem href="/admin/admins/users" icon={ShieldAlert} label="Admin Users" />
        </NavGroup>
      </div>
      
      <div className="p-4 border-t border-[var(--color-border)] mt-auto">
        <Link 
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-surface-hover)] text-white hover:bg-slate-700 transition-colors"
        >
          Exit Admin
        </Link>
      </div>
    </aside>
  );
}
