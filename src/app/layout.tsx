import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
