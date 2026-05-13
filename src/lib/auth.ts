import { cookies } from "next/headers";
import { verifyToken, getUserById, User } from "./services";

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return getUserById(decoded.id);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "tahun"],
    [2592000, "bulan"],
    [86400, "hari"],
    [3600, "jam"],
    [60, "menit"],
    [1, "detik"],
  ];

  for (const [secondsInInterval, label] of intervals) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) return `${interval} ${label} lalu`;
  }
  return "baru saja";
}
