import Link from "next/link";

const links = [
  { href: "/register", label: "Daftar" },
  { href: "/login", label: "Masuk" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ marginTop: "4rem" }}
    >
      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "2.5rem" }}
      >
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-3 text-lg font-bold tracking-[-0.02em] text-[var(--color-text-primary)] no-underline"
              aria-label="DonasiKu beranda"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-primary)]/10 text-base"
                aria-hidden="true"
              >
                💜
              </span>
              DonasiKu
            </Link>

            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
              Platform donasi QRIS untuk creator Indonesia.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--color-text-secondary)] no-underline transition-colors hover:text-[var(--color-text-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© <span suppressHydrationWarning>{currentYear}</span> DonasiKu. All rights reserved.</p>
          <p>Simple. Fast. Reliable.</p>
        </div>
      </div>
    </footer>
  );
}
