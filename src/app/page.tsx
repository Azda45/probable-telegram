"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const FEATURES = [
  { icon: "📱", title: "QRIS Payment", desc: "Scan and pay from any e-wallet" },
  { icon: "🔔", title: "Real-time Overlay", desc: "Instant notifications for OBS" },
  { icon: "🔊", title: "Instant Alert Sound", desc: "Cached low-latency OBS audio alerts" },
  { icon: "📊", title: "Analytics", desc: "Track your revenue growth" },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ display_name: string } | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setUser(data.user);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setUser(null);
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="container" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        {/* Hero Section */}
        <section style={{ textAlign: "center", marginBottom: "6rem" }} className="animate-fade-in">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(99,102,241,0.1)", color: "var(--color-primary-light)", padding: "0.5rem 1rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span>⚡</span> Simple. Fast. Reliable.
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "1.5rem", lineHeight: 1.1 }}>
            Dukung Streamer Favorit <br />
            <span style={{ color: "var(--color-primary)" }}>Tanpa Ribet.</span>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
            Solusi donasi QRIS real-time tercepat di Indonesia. Setup overlay OBS hanya dalam 2 menit.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            {user ? (
              <button className="btn btn-primary btn-lg" onClick={() => router.push("/dashboard")}>
                Buka Dashboard
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => router.push("/register")}>
                  Mulai Sekarang
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => router.push("/login")}>
                  Masuk
                </button>
              </>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }} className="animate-fade-in">
          {FEATURES.map((f, i) => (
            <div key={i} className="card card-hover" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Minimalist Footer */}
        <footer style={{ marginTop: "8rem", borderTop: "1px solid var(--color-border)", paddingTop: "4rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            © 2024 DonasiKu. Built for streamers by streamers.
          </div>
        </footer>
      </main>
    </div>
  );
}
