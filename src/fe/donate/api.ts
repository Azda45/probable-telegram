import type { DonationFormState } from "./types";

interface CreateDonationResponse {
  donation: {
    orderId: string;
    statusToken: string;
    qrUrl: string;
  };
  error?: string;
}

export async function createDonationCheckout(username: string, form: DonationFormState): Promise<CreateDonationResponse> {
  const response = await fetch("/api/donate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      donorName: form.donorName.trim(),
      donorEmail: form.donorEmail.trim().toLowerCase(),
      amount: Math.floor(form.amount),
      message: form.message.trim() || undefined,
    }),
  });

  const data = (await response.json()) as CreateDonationResponse;
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function checkDonationPaid(orderId: string, statusToken: string): Promise<boolean> {
  const response = await fetch(`/api/donate/${orderId}?token=${encodeURIComponent(statusToken)}`, { cache: "no-store" });
  const data = (await response.json()) as { paid?: boolean };
  return Boolean(data.paid);
}
