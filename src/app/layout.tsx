import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DonasiKu - Platform Donasi Streamer Indonesia",
  description:
    "Platform donasi dan tip untuk streamer Indonesia. Terima donasi dari viewers dengan mudah melalui QRIS. Gratis dan aman.",
  keywords: ["donasi", "streamer", "tip", "QRIS", "Indonesia", "saweria", "trakteer"],
  authors: [{ name: "DonasiKu" }],
  openGraph: {
    title: "DonasiKu - Platform Donasi Streamer",
    description: "Terima donasi dari viewers dengan mudah melalui QRIS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)]`}>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
