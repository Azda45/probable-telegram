export default function DonateLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "var(--color-bg)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: "2rem" }}>
        <div className="mx-auto mb-4 h-[72px] w-[72px] rounded-full shimmer" />
        <div className="mx-auto mb-2 h-6 w-40 rounded-lg shimmer" />
        <div className="mx-auto mb-8 h-4 w-24 rounded-lg shimmer" />
        <div className="mb-5 h-11 rounded-lg shimmer" />
        <div className="mb-5 h-11 rounded-lg shimmer" />
        <div className="mb-6 h-24 rounded-lg shimmer" />
        <div className="h-12 rounded-lg shimmer" />
      </div>
    </div>
  );
}
