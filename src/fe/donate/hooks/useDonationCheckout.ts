import { useCallback, useMemo, useState } from "react";
import { createDonationCheckout } from "../api";
import { getAvatarUrl } from "@/shared/avatar";
import { validateDonationForm } from "../validation";
import type {
  DonationFieldErrors,
  DonationFormState,
  DonationQrData,
  DonationStage,
  UserInfo,
} from "../types";
import usePaymentStatusSocket from "./usePaymentStatusSocket";

interface UseDonationCheckoutArgs {
  user: UserInfo;
  username: string;
}

export default function useDonationCheckout({ user, username }: UseDonationCheckoutArgs) {
  const [stage, setStage] = useState<DonationStage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<DonationFieldErrors>({});
  const [qrData, setQrData] = useState<DonationQrData | null>(null);
  const [form, setForm] = useState<DonationFormState>({
    donorName: "",
    donorEmail: "",
    amount: user.min_amount || 10000,
    message: "",
  });

  const markPaid = useCallback(() => setStage("success"), []);
  usePaymentStatusSocket({ stage, qrData, onPaid: markPaid });

  const avatarUrl = useMemo(() => getAvatarUrl(user.display_name, user.avatar_url), [user.avatar_url, user.display_name]);
  const presetAmounts = useMemo(
    () => [5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000]
      .filter((amount) => amount >= user.min_amount && amount <= user.max_amount),
    [user.max_amount, user.min_amount]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const nextErrors = validateDonationForm(form, user);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const data = await createDonationCheckout(username, form);
      setQrData({
        orderId: data.donation.orderId,
        statusToken: data.donation.statusToken,
        qrUrl: data.donation.qrUrl,
        amount: Math.floor(form.amount),
      });
      setStage("qr");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForAnotherDonation = () => {
    setStage("form");
    setForm({ donorName: form.donorName, donorEmail: form.donorEmail, amount: user.min_amount || 10000, message: "" });
  };

  return {
    avatarUrl,
    error,
    fieldErrors,
    form,
    handleSubmit,
    presetAmounts,
    qrData,
    resetForAnotherDonation,
    setForm,
    setStage,
    stage,
    submitting,
  };
}
