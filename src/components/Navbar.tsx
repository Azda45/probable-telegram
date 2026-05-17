"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: { display_name: string } | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const router = useRouter();

  return (
    <nav style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", padding: "1rem 0" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--color-primary)" }}>💜</span> DonasiKu
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>LOGGED IN AS</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{user.display_name}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onLogout}
                style={{ borderRadius: "8px", height: 32 }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push("/login")}>Masuk</button>
              <button className="btn btn-primary btn-sm" onClick={() => router.push("/register")}>Daftar</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
