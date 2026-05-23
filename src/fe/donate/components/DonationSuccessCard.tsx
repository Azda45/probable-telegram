import { formatRupiah } from "@/shared/utils";
import type { DonationQrData, UserInfo } from "../types";

interface DonationSuccessCardProps {
  qrData: DonationQrData | null;
  user: UserInfo;
  onDonateAgain: () => void;
}

export default function DonationSuccessCard({ qrData, user, onDonateAgain }: DonationSuccessCardProps) {
  return (
    <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Terima Kasih!</h2>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
        Donasi kamu sebesar <strong className="gradient-text">{formatRupiah(qrData?.amount || 0)}</strong>{" "}
        berhasil dikirim ke <strong>{user.display_name}</strong>
      </p>
      <button className="btn btn-primary" onClick={onDonateAgain}>💜 Donasi Lagi</button>
    </div>
  );
}
