const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  pending: { className: "bg-warning/10 text-warning border-warning/20", label: "Menunggu" },
  settlement: { className: "bg-success/10 text-success border-success/20", label: "Berhasil" },
  capture: { className: "bg-success/10 text-success border-success/20", label: "Berhasil" },
  expire: { className: "bg-danger/10 text-danger border-danger/20", label: "Kadaluarsa" },
  cancel: { className: "bg-danger/10 text-danger border-danger/20", label: "Dibatalkan" },
  deny: { className: "bg-danger/10 text-danger border-danger/20", label: "Ditolak" },
  fraud: { className: "bg-danger/10 text-danger border-danger/20", label: "Fraud" },
};

export default function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] || { className: "bg-primary-light/10 text-primary-light border-primary-light/20", label: status };

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>;
}
