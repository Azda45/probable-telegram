import Image from "next/image";
import { formatRupiah } from "@/shared/utils";
import type { DonationQrData } from "../types";

interface PaymentQrCardProps {
  qrData: DonationQrData;
  onBack: () => void;
}

export default function PaymentQrCard({ qrData, onBack }: PaymentQrCardProps) {
  return (
    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Scan QR untuk Bayar</h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Gunakan e-wallet atau mobile banking apa pun yang mendukung QRIS
      </p>
      <div style={{ background: "white", borderRadius: 16, padding: "1.5rem", display: "inline-block", marginBottom: "1.5rem", boxShadow: "0 0 30px rgba(139,92,246,0.2)" }}>
        <Image src={qrData.qrUrl} alt="QR Code" width={220} height={220} unoptimized style={{ width: 220, height: 220 }} />
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }} className="gradient-text">
        {formatRupiah(qrData.amount)}
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Menunggu pembayaran...</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", background: "rgba(245,158,11,0.1)", borderRadius: 10, fontSize: "0.8125rem", color: "#fbbf24" }}>
        <div className="shimmer" style={{ width: 8, height: 8, borderRadius: "50%" }} />
        Menunggu pembayaran dari QRIS...
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: "1rem" }} onClick={onBack}>
        ← Kembali
      </button>
    </div>
  );
}
