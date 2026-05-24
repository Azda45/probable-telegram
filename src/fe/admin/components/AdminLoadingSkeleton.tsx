"use client";

interface AdminLoadingSkeletonProps {
  type?: "table" | "cards" | "settings";
  rows?: number;
}

export default function AdminLoadingSkeleton({ type = "table", rows = 6 }: AdminLoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl">
              <div className="h-3 bg-[var(--color-surface-hover)] rounded w-2/3 mb-3 animate-pulse" />
              <div className="h-7 bg-[var(--color-surface-hover)] rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl">
          <div className="h-5 bg-[var(--color-surface-hover)] rounded w-1/4 mb-6 animate-pulse" />
          <div className="h-[300px] bg-[var(--color-surface-hover)] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (type === "settings") {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden max-w-2xl animate-in fade-in duration-300">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
          <div className="h-6 bg-[var(--color-surface-hover)] rounded w-1/3 animate-pulse" />
          <div className="h-9 bg-[var(--color-surface-hover)] rounded w-32 animate-pulse" />
        </div>
        <div className="p-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-[var(--color-surface-hover)] rounded w-1/4 mb-2 animate-pulse" />
              <div className="h-3 bg-[var(--color-surface-hover)] rounded w-2/3 mb-3 animate-pulse" />
              <div className="h-10 bg-[var(--color-surface-hover)] rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in duration-300">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <div className="h-6 bg-[var(--color-surface-hover)] rounded w-1/4 animate-pulse" />
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-6">
            <div className="h-4 bg-[var(--color-surface-hover)] rounded w-1/6 animate-pulse" />
            <div className="h-4 bg-[var(--color-surface-hover)] rounded w-1/5 animate-pulse" />
            <div className="h-4 bg-[var(--color-surface-hover)] rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-[var(--color-surface-hover)] rounded w-1/6 animate-pulse" />
            <div className="h-6 bg-[var(--color-surface-hover)] rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
