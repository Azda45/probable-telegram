"use client";

import Link from "next/link";

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export default function AuthFormLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthFormLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "var(--color-surface)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ textDecoration: "none", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            <span style={{ color: "var(--color-primary)" }}>💜</span> DonasiKu
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
            {title}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {subtitle}
          </p>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {children}
        </div>

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          {footerText}{" "}
          <Link href={footerLinkHref} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
