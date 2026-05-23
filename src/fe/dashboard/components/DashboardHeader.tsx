export default function DashboardHeader({ displayName }: { displayName: string }) {
  return (
    <div className="mt-10 mb-10" style={{ marginTop: "2.5rem", marginBottom: "2.5rem" }}>
      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary-light)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full mb-3">
        <span>✦</span> Dashboard
      </div>
      <h1 className="text-3xl font-bold mb-1">
        Halo, {displayName} 👋
      </h1>
      <p className="text-[var(--color-text-muted)] text-sm">Pantau donasi dan kelola profil streaming kamu</p>
    </div>
  );
}
