"use client";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <div className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-2 mb-2">
        <span className="text-[var(--color-primary)]">{icon}</span>
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}
