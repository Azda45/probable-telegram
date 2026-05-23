import Navbar from "@/components/Navbar";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <Navbar user={null} />

      <div className="container">
        <div className="mt-10 mb-10" style={{ marginTop: "2.5rem", marginBottom: "2.5rem" }}>
          <div className="shimmer h-9 w-48 rounded-lg mb-2" />
          <div className="shimmer h-5 w-64 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ gap: "1rem", marginBottom: "2rem" }}>
          <div className="card p-4 sm:p-5 shimmer border-transparent md:col-span-1">
            <div className="shimmer h-3 w-24 rounded mb-2" />
            <div className="shimmer h-9 w-full rounded mb-3" />
            <div className="flex gap-2">
              <div className="shimmer h-8 w-20 rounded" />
              <div className="shimmer h-8 w-20 rounded" />
            </div>
          </div>
          <div className="card p-4 sm:p-5 shimmer border-transparent md:col-span-2">
            <div className="shimmer h-3 w-28 rounded mb-2" />
            <div className="shimmer h-9 w-full rounded mb-3" />
            <div className="flex gap-2">
              <div className="shimmer h-8 w-20 rounded" />
              <div className="shimmer h-8 w-28 rounded" />
              <div className="shimmer h-8 w-28 rounded" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8" style={{ marginBottom: "2rem" }}>
          <div className="shimmer h-10 w-28 rounded-lg" />
          <div className="shimmer h-10 w-28 rounded-lg" />
          <div className="shimmer h-10 w-32 rounded-lg" />
        </div>

        <div className="card h-[120px] shimmer rounded-xl border-transparent mb-10" />
      </div>
    </div>
  );
}
