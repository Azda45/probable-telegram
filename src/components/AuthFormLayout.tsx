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
    <div className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-hidden bg-[var(--color-surface)]">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_50%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

      <div className="w-full max-w-[400px] relative">
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
              <Link href={footerLinkHref} className="text-[var(--color-primary)] no-underline font-semibold hover:text-[var(--color-primary-light)] transition-colors">
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
