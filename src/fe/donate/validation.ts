import { formatRupiah } from "@/shared/utils";
import type { DonationFieldErrors, DonationFormState, UserInfo } from "./types";

export function validateDonationForm(form: DonationFormState, user: UserInfo): DonationFieldErrors {
  const errors: DonationFieldErrors = {};
  const minAmount = user.min_amount || 1000;
  const maxAmount = user.max_amount || 10000000;

  if (!form.donorName.trim()) errors.donorName = "Nama wajib diisi";
  else if (form.donorName.trim().length < 2) errors.donorName = "Nama minimal 2 karakter";

  if (!form.amount || form.amount < minAmount) errors.amount = `Minimal donasi ${formatRupiah(minAmount)}`;
  else if (form.amount > maxAmount) errors.amount = `Maksimal donasi ${formatRupiah(maxAmount)}`;
  else if (!Number.isInteger(form.amount)) errors.amount = "Jumlah harus bilangan bulat";

  if (!form.donorEmail.trim()) errors.donorEmail = "Email wajib diisi";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail)) errors.donorEmail = "Format email tidak valid";

  return errors;
}
