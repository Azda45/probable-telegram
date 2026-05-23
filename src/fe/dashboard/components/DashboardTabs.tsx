import { CircleDollarSign, LayoutDashboard, Settings } from "lucide-react";

export type DashboardTab = "overview" | "donations" | "settings";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const TABS = [
  { id: "overview" as const, label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "donations" as const, label: "Donasi", icon: <CircleDollarSign className="w-4 h-4" /> },
  { id: "settings" as const, label: "Pengaturan", icon: <Settings className="w-4 h-4" /> },
];

export default function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <div
      className="bg-[var(--color-surface-card)] p-1 rounded-xl border border-[var(--color-border)] w-full sm:w-fit"
      style={{ display: "flex", gap: "0.25rem", marginBottom: "2rem" }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`btn btn-sm border-none transition-all duration-200 flex-1 sm:flex-none ${activeTab === tab.id
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "bg-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
