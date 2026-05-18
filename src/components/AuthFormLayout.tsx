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
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-[var(--color-surface)]">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <Link href="/" className="no-underline text-2xl font-bold text-[var(--color-text-primary)]">
            <span className="text-[var(--color-primary)]">💜</span> DonasiKu
          </Link>
          <h1 className="text-2xl font-bold mt-8 mb-2">
            {title}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        </div>

        <div className="card p-8">
          {children}

          <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              {footerText}{" "}
              <Link href={footerLinkHref} className="text-[var(--color-primary)] no-underline font-semibold">
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
