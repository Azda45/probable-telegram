"use client";

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span>{icon}</span>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{value}</div>
    </div>
  );
}
