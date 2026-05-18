"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import StatCard from "@/components/StatCard";
import CopyLink from "@/components/CopyLink";
import DonationTable from "@/components/DonationTable";
import { 
  LayoutDashboard, 
  Settings, 
  CircleDollarSign, 
  Banknote, 
  Gift, 
  TrendingUp, 
  Zap, 
  ExternalLink,
  MonitorPlay,
  Bell,
  Save,
  KeyRound,
  CheckCircle2,
  Clock,
  XCircle,
  ListFilter,
  User as UserIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { User, DonationRecord, DonationStats } from "@/lib/types";

type Tab = "overview" | "donations" | "settings";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [donationPage, setDonationPage] = useState(1);
  const [donationTotal, setDonationTotal] = useState(0);
  const [donationFilter, setDonationFilter] = useState<"all" | "success" | "pending" | "failed">("success");
  const [loading, setLoading] = useState(true);
  const [testingSend, setTestingSend] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    display_name: "",
    bio: "",
    min_amount: 1000,
    alert_duration: 5,
    avatar_url: "",
    alert_sound: "default",
    max_amount: 10000000,
    overlay_style: "right",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) { window.location.href = "/login"; return; }
      const data = await res.json();
      setUser(data.user);
      setStats(data.stats);
      setSettingsForm({
        display_name: data.user.display_name || "",
        bio: data.user.bio || "",
        min_amount: data.user.min_amount || 1000,
        alert_duration: data.user.alert_duration || 5,
        avatar_url: data.user.avatar_url || "",
        alert_sound: data.user.alert_sound || "default",
        max_amount: data.user.max_amount || 10000000,
        overlay_style: data.user.overlay_style || "right",
      });
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDonations = useCallback(async (page: number = 1, filter: "all" | "success" | "pending" | "failed" = "all") => {
    try {
      const url = new URL("/api/donations", window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "15");
      if (filter !== "all") {
        url.searchParams.set("status", filter);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations);
        setDonationTotal(data.total);
        setDonationPage(page);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchProfile();
      fetchDonations(1, donationFilter);
    });
  }, [fetchProfile, fetchDonations, donationFilter]);

  // Auto-hide balance: 30s if no activity, 60s if there is activity
  useEffect(() => {
    if (!showBalance) return;
    
    let timeout: NodeJS.Timeout;
    let lastActivityReset = Date.now();

    const hide = () => setShowBalance(false);

    // Initial timer: 30 seconds
    timeout = setTimeout(hide, 30000);

    const handleActivity = () => {
      const now = Date.now();
      // Throttle resets to max 1 per second to avoid performance issues
      if (now - lastActivityReset > 1000) {
        lastActivityReset = now;
        clearTimeout(timeout);
        // If there is activity, extend timeout to 60 seconds
        timeout = setTimeout(hide, 60000);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [showBalance]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      toast.success("Pengaturan berhasil disimpan!");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleRegenKeys = async () => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_keys" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Keys berhasil di-generate ulang!");
      setShowRegenModal(false);
      fetchProfile();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleTestOverlay = async () => {
    setTestingSend(true);
    try {
      const res = await fetch("/api/overlay/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Test notifikasi dikirim! (${data.donation.donor_name} — Rp${data.donation.amount.toLocaleString("id-ID")})`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setTestingSend(false);
    }
  };

  const handleReplayDonation = async (donationId: string) => {
    try {
      const res = await fetch("/api/overlay/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`🔄 Replay: ${data.donation.donor_name} — ${formatRupiah(data.donation.amount)}`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Render empty Navbar while loading */}
        <Navbar user={null} />
        
        <div className="container mx-auto px-6">
        {/* Header Skeleton */}
        <div className="mt-10 mb-10" style={{ marginTop: "2.5rem", marginBottom: "2.5rem" }}>
          <div className="shimmer h-9 w-48 rounded-lg mb-2" />
          <div className="shimmer h-5 w-64 rounded-lg" />
        </div>

          {/* Quick Links Skeleton */}
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

          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-8" style={{ marginBottom: "2rem" }}>
            <div className="shimmer h-10 w-28 rounded-lg" />
            <div className="shimmer h-10 w-28 rounded-lg" />
            <div className="shimmer h-10 w-32 rounded-lg" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="card h-[120px] shimmer rounded-xl border-transparent mb-10" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const donateUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/donate/${user.username}`;
  const overlayUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/overlay?token=${user.overlay_token}`;

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-6">
        <div className="mt-10 mb-10" style={{ marginTop: "2.5rem", marginBottom: "2.5rem" }}>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Selamat datang kembali, {user?.display_name}</p>
          </div>

        {/* Quick Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ gap: "1rem", marginBottom: "2rem" }}>
          <div className="card p-4 sm:p-5 md:col-span-1">
            <CopyLink
              label="Link Donasi"
              url={donateUrl}
              actions={
                <a href={donateUrl} target="_blank" className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[100px]">
                  <ExternalLink className="w-4 h-4" />
                  Buka
                </a>
              }
            />
          </div>
          <div className="card p-4 sm:p-5 md:col-span-2">
            <CopyLink
              label="URL Overlay"
              url={overlayUrl}
              actions={
                <>
                  <a href={overlayUrl} target="_blank" className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[100px]">
                    <MonitorPlay className="w-4 h-4" />
                    Buka Overlay
                  </a>
                  <button
                    className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 min-w-[100px]"
                    onClick={handleTestOverlay}
                    disabled={testingSend}
                  >
                    <Bell className="w-4 h-4" />
                    {testingSend ? "..." : "Tes Notifikasi"}
                  </button>
                  <button
                    className="btn btn-danger btn-sm flex-1 flex items-center justify-center gap-2 min-w-[100px]"
                    onClick={() => setShowRegenModal(true)}
                  >
                    <KeyRound className="w-4 h-4" />
                    Regenerate
                  </button>
                </>
              }
            />
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="bg-[var(--color-surface-card)] p-1 rounded-xl border border-[var(--color-border)] w-fit"
          style={{ display: "flex", gap: "0.25rem", marginBottom: "2rem" }}
        >
          {([
            { id: "overview" as Tab, label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "donations" as Tab, label: "Donasi", icon: <CircleDollarSign className="w-4 h-4" /> },
            { id: "settings" as Tab, label: "Pengaturan", icon: <Settings className="w-4 h-4" /> },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === "donations") fetchDonations(); }}
              className={`btn btn-sm border-none transition-all duration-200 ${
                tab === t.id 
                  ? "bg-[var(--color-primary)] text-white shadow-sm" 
                  : "bg-transparent text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && stats && (
          <div>
            <div className="card mb-10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border-violet-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Banknote className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
                  <Banknote className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-violet-400/80 mb-1 uppercase tracking-wider">Total Pendapatan</p>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-bold tracking-tight">
                      {showBalance ? formatRupiah(stats.totalAmount) : "Rp ••••••••"}
                    </h2>
                    <button 
                      onClick={() => setShowBalance(!showBalance)} 
                      className="text-violet-400/60 hover:text-violet-400 transition-colors focus:outline-none"
                      title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
                    >
                      {showBalance ? <EyeOff className="w-7 h-7" /> : <Eye className="w-7 h-7" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {stats.topDonors.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-5">🏆 Top Donors</h3>
                <div className="flex flex-col gap-3">
                  {stats.topDonors.map((d, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-surface-elevated)]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[13px] ${
                        i === 0 ? "bg-gradient-to-br from-amber-500 to-amber-400 text-[#0f0f23]" :
                        i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-300 text-[#0f0f23]" :
                        i === 2 ? "bg-gradient-to-br from-amber-700 to-amber-600 text-[#0f0f23]" :
                        "bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[15px]">{d.donor_name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{d.count}x donasi</div>
                      </div>
                      <div className="font-bold text-[var(--color-success)]">{formatRupiah(d.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Donations Tab */}
        {tab === "donations" && (
          <div>
            <DonationTable
              donations={donations}
              page={donationPage}
              total={donationTotal}
              perPage={15}
              onPageChange={(p) => fetchDonations(p, donationFilter)}
              onReplay={handleReplayDonation}
            />
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start max-w-5xl" style={{ gap: "1.5rem" }}>
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <div className="card h-full">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[var(--color-primary)]" /> Profil
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Nama Tampilan</label>
                    <input
                      className="input"
                      value={settingsForm.display_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, display_name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">URL Avatar</label>
                    <input
                      className="input"
                      value={settingsForm.avatar_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, avatar_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Bio</label>
                    <textarea
                      className="input"
                      value={settingsForm.bio}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                      placeholder="Ceritakan tentang dirimu..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <div className="card">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-[var(--color-primary)]" /> Pengaturan Donasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Minimal Donasi (Rp)</label>
                    <input
                      className="input"
                      type="number"
                      min={1000}
                      step={1000}
                      value={settingsForm.min_amount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, min_amount: parseInt(e.target.value) || 1000 })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Maksimal Donasi (Rp)</label>
                    <input
                      className="input"
                      type="number"
                      min={1000}
                      step={1000}
                      value={settingsForm.max_amount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, max_amount: parseInt(e.target.value) || 10000000 })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Durasi Alert (detik)</label>
                    <input
                      className="input"
                      type="number"
                      min={3}
                      max={30}
                      value={settingsForm.alert_duration}
                      onChange={(e) => setSettingsForm({ ...settingsForm, alert_duration: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Suara Notifikasi</label>
                    <select
                      className="input"
                      value={settingsForm.alert_sound}
                      onChange={(e) => setSettingsForm({ ...settingsForm, alert_sound: e.target.value })}
                    >
                      <option value="default">Default (Ting!)</option>
                      <option value="none">Tanpa Suara</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">Gaya Overlay (Shadow)</label>
                    <select
                      className="input"
                      value={settingsForm.overlay_style}
                      onChange={(e) => setSettingsForm({ ...settingsForm, overlay_style: e.target.value })}
                    >
                      <option value="right">Kanan Atas (Default)</option>
                      <option value="left">Kiri Atas</option>
                      <option value="none">Datar / Tanpa Shadow Biasa</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex justify-end">
                  <button className="btn btn-primary flex items-center gap-2" onClick={handleSaveSettings}>
                    <Save className="w-4 h-4" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regenerate Keys Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Regenerate URL Overlay?</h3>
              <p className="text-[var(--color-text-secondary)] text-center text-sm mb-6">
                Tindakan ini akan mengganti token rahasia Anda. <strong className="text-red-400">URL overlay yang lama tidak akan bisa digunakan lagi.</strong> Anda harus memperbarui URL di OBS/Streamlabs setelah melakukan ini.
              </p>
              <div className="flex gap-3">
                <button 
                  className="btn btn-secondary w-full" 
                  onClick={() => setShowRegenModal(false)}
                >
                  Batal
                </button>
                <button 
                  className="btn btn-danger w-full flex items-center justify-center gap-2" 
                  onClick={handleRegenKeys}
                >
                  <KeyRound className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
