/**
 * Format number to Indonesian Rupiah string
 */
export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Format a date string into relative time (e.g., "5 menit lalu")
 */
export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "tahun"],
    [2592000, "bulan"],
    [86400, "hari"],
    [3600, "jam"],
    [60, "menit"],
    [1, "detik"],
  ];
  for (const [s, l] of intervals) {
    const i = Math.floor(seconds / s);
    if (i >= 1) return `${i} ${l} lalu`;
  }
  return "baru saja";
}
