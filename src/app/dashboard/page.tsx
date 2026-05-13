"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast, { showToast } from "@/components/Toast";
import StatCard from "@/components/StatCard";
import CopyLink from "@/components/CopyLink";
import DonationTable from "@/components/DonationTable";
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
  const [donationFilter, setDonationFilter] = useState<"all" | "success" | "pending" | "failed">("all");
  const [loading, setLoading] = useState(true);
  const [testingSend, setTestingSend] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    display_name: "",
    bio: "",
    min_amount: 1000,
    alert_duration: 5,
    avatar_url: "",
    alert_sound: "default",
    tts_enabled: true,
    tts_voice: "",
    max_amount: 10000000,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) { router.push("/login"); return; }
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
          tts_enabled: data.user.tts_enabled ?? true,
          tts_voice: data.user.tts_voice || "",
          max_amount: data.user.max_amount || 10000000,
        });
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

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
    fetchProfile();
    fetchDonations(1, donationFilter);
  }, [fetchProfile, fetchDonations, donationFilter]);

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
      showToast("success", "Pengaturan berhasil disimpan!");
    } catch (err: unknown) {
      showToast("error", (err as Error).message);
    }
  };

  const handleRegenKeys = async () => {
    if (!confirm("Regenerate keys? Overlay kamu akan berhenti bekerja sampai kamu update URL-nya.")) return;
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_keys" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", "Keys berhasil di-generate ulang!");
      fetchProfile();
    } catch (err: unknown) {
      showToast("error", (err as Error).message);
    }
  };

  const handleTestOverlay = async () => {
    setTestingSend(true);
    try {
      const res = await fetch("/api/overlay/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", `Test notifikasi dikirim! (${data.donation.donor_name} — Rp${data.donation.amount.toLocaleString("id-ID")})`);
    } catch (err: unknown) {
      showToast("error", (err as Error).message);
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
      showToast("success", `🔄 Replay: ${data.donation.donor_name} — ${formatRupiah(data.donation.amount)}`);
    } catch (err: unknown) {
      showToast("error", (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="shimmer" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const donateUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/donate/${user.username}`;
  const overlayUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/overlay?token=${user.overlay_token}`;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Toast />
      <Navbar user={user} onLogout={handleLogout} />

      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        {/* Minimalist Header */}
        <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>Dashboard</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Selamat datang kembali, {user?.display_name}</p>
          </div>
          
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleTestOverlay}
              disabled={testingSend}
            >
              {testingSend ? "..." : "🔔 Test Overlay"}
            </button>
            <a href={donateUrl} target="_blank" className="btn btn-primary btn-sm">
              Lihat Halaman Donasi ↗
            </a>
          </div>
        </div>

        {/* Quick Links Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div className="card" style={{ padding: "1rem 1.25rem" }}>
            <CopyLink label="Link Donasi" url={donateUrl} />
          </div>
          <div className="card" style={{ padding: "1rem 1.25rem" }}>
            <CopyLink label="URL Overlay" url={overlayUrl} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "2rem", background: "var(--color-surface-card)", padding: "0.25rem", borderRadius: 12, border: "1px solid var(--color-border)", width: "fit-content" }}>
          {([
            { id: "overview" as Tab, label: "📊 Overview" },
            { id: "donations" as Tab, label: "💰 Donasi" },
            { id: "settings" as Tab, label: "⚙️ Pengaturan" },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === "donations") fetchDonations(); }}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: 10,
                border: "none",
                background: tab === t.id ? "var(--color-primary)" : "transparent",
                color: tab === t.id ? "white" : "var(--color-text-secondary)",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && stats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
              <StatCard icon="💰" value={formatRupiah(stats.totalAmount)} label="Total" />
              <StatCard icon="🎁" value={String(stats.totalDonations)} label="Donasi" />
              <StatCard icon="📈" value={formatRupiah(stats.todayAmount)} label="Hari Ini" />
              <StatCard icon="🔥" value={String(stats.todayDonations)} label="Sesi Ini" />
            </div>

            {stats.topDonors.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>🏆 Top Donors</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {stats.topDonors.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", borderRadius: 10, background: "var(--color-surface-elevated)" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: i === 0 ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : i === 1 ? "linear-gradient(135deg, #94a3b8, #cbd5e1)" : i === 2 ? "linear-gradient(135deg, #b45309, #d97706)" : "var(--color-surface-hover)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8125rem",
                        color: i < 3 ? "#0f0f23" : "var(--color-text-secondary)",
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{d.donor_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{d.count}x donasi</div>
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--color-success)" }}>{formatRupiah(d.total)}</div>
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
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
              {(
                [
                  { id: "all", label: "Semua Donasi" },
                  { id: "success", label: "✅ Berhasil" },
                  { id: "pending", label: "⏳ Menunggu" },
                  { id: "failed", label: "❌ Gagal/Batal" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setDonationFilter(f.id);
                    fetchDonations(1, f.id);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: 20,
                    border: "none",
                    background: donationFilter === f.id ? "var(--color-primary)" : "var(--color-surface-elevated)",
                    color: donationFilter === f.id ? "white" : "var(--color-text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

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
          <div style={{ display: "grid", gap: "1.5rem", maxWidth: 600 }}>
            <div className="card">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>Profil</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="input-group">
                  <label>Nama Tampilan</label>
                  <input
                    className="input"
                    value={settingsForm.display_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, display_name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Bio</label>
                  <textarea
                    className="input"
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                    placeholder="Ceritakan tentang dirimu..."
                    rows={3}
                  />
                </div>
                <div className="input-group">
                  <label>URL Avatar</label>
                  <input
                    className="input"
                    value={settingsForm.avatar_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <small style={{ color: "var(--color-text-muted)", marginTop: "0.25rem", display: "block" }}>
                    Masukkan link URL gambar untuk foto profilmu.
                  </small>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>Pengaturan Donasi</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="input-group">
                  <label>Minimal Donasi (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    min={1000}
                    step={1000}
                    value={settingsForm.min_amount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_amount: parseInt(e.target.value) || 1000 })}
                  />
                </div>
                <div className="input-group">
                  <label>Maksimal Donasi (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    min={1000}
                    step={1000}
                    value={settingsForm.max_amount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, max_amount: parseInt(e.target.value) || 10000000 })}
                  />
                </div>
                <div className="input-group">
                  <label>Durasi Alert (detik)</label>
                  <input
                    className="input"
                    type="number"
                    min={3}
                    max={30}
                    value={settingsForm.alert_duration}
                    onChange={(e) => setSettingsForm({ ...settingsForm, alert_duration: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <div className="input-group">
                  <label>Suara Notifikasi</label>
                  <select
                    className="input"
                    value={settingsForm.alert_sound}
                    onChange={(e) => setSettingsForm({ ...settingsForm, alert_sound: e.target.value })}
                  >
                    <option value="default">Default (Ting!)</option>
                    <option value="none">Tanpa Suara</option>
                  </select>
                </div>
                <div className="input-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="tts"
                    checked={settingsForm.tts_enabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tts_enabled: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "var(--color-primary)" }}
                  />
                  <label htmlFor="tts" style={{ marginBottom: 0, cursor: "pointer" }}>Aktifkan Pembaca Pesan (Text-to-Speech)</label>
                </div>
                {settingsForm.tts_enabled && (
                  <div className="input-group">
                    <label>Bahasa & Varian Suara TTS</label>
                    <select
                      className="input"
                      value={settingsForm.tts_voice || "id"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tts_voice: e.target.value })}
                    >
                      <optgroup label="👩 Suara Perempuan (Cloud)">
                        <option value="id">👩 Indonesia (Indo A)</option>
                        <option value="en">👩 English (US)</option>
                        <option value="ja">👩 Jepang (Japan)</option>
                        <option value="ko">👩 Korea (Korean)</option>
                      </optgroup>
                      <optgroup label="👨 Suara Laki-laki (Sistem Browser)">
                        <option value="male-id">👨 Indonesia (Male)</option>
                        <option value="male-en">👨 English (Male)</option>
                      </optgroup>
                      <optgroup label="🌐 Dialek Lain (Perempuan)">
                        <option value="ms">🇲🇾 Malay</option>
                        <option value="jv">🇮🇩 Jawa</option>
                        <option value="su">🇮🇩 Sunda</option>
                      </optgroup>
                    </select>
                    <small style={{ color: "var(--color-text-muted)", marginTop: "0.25rem", display: "block" }}>
                      Pilih aksen bahasa yang akan digunakan untuk membaca pesan donasi.
                    </small>
                  </div>
                )}
              </div>
              <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={handleSaveSettings}>
                💾 Simpan Pengaturan
              </button>
            </div>

            <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>🔑 Keamanan</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                Regenerate keys akan membuat overlay URL dan stream key baru. Kamu perlu update URL di OBS.
              </p>
              <button className="btn btn-danger btn-sm" onClick={handleRegenKeys}>
                Regenerate Keys
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
