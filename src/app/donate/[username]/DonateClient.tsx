"use client";

import Link from "next/link";
import type { UserInfo } from "@/fe/donate/types";
import useDonationCheckout from "@/fe/donate/hooks/useDonationCheckout";
import DonationFormCard from "@/fe/donate/components/DonationFormCard";
import PaymentQrCard from "@/fe/donate/components/PaymentQrCard";
import DonationSuccessCard from "@/fe/donate/components/DonationSuccessCard";

interface DonateClientProps {
  user: UserInfo;
  username: string;
}

export default function DonateClient({ user, username }: DonateClientProps) {
  const checkout = useDonationCheckout({ user, username });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {checkout.stage === "form" && (
          <DonationFormCard
            avatarUrl={checkout.avatarUrl}
            error={checkout.error}
            fieldErrors={checkout.fieldErrors}
            form={checkout.form}
            onSubmit={checkout.handleSubmit}
            presetAmounts={checkout.presetAmounts}
            setForm={checkout.setForm}
            submitting={checkout.submitting}
            user={user}
            username={username}
          />
        )}

        {checkout.stage === "qr" && checkout.qrData && (
          <PaymentQrCard qrData={checkout.qrData} onBack={() => checkout.setStage("form")} />
        )}

        {checkout.stage === "success" && (
          <DonationSuccessCard qrData={checkout.qrData} user={user} onDonateAgain={checkout.resetForAnotherDonation} />
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] no-underline transition-colors duration-200"
          >
            💜 DonasiKu
          </Link>
        </div>
      </div>
    </div>
  );
}
