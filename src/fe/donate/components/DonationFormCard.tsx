import ErrorAlert from "@/components/ErrorAlert";
import { formatRupiah } from "@/shared/utils";
import type { DonationFieldErrors, DonationFormState, UserInfo } from "../types";
import DonateProfileHeader from "./DonateProfileHeader";

interface DonationFormCardProps {
  avatarUrl: string;
  error: string;
  fieldErrors: DonationFieldErrors;
  form: DonationFormState;
  onSubmit: (event: React.FormEvent) => void;
  presetAmounts: number[];
  setForm: (form: DonationFormState) => void;
  submitting: boolean;
  user: UserInfo;
  username: string;
}

function parseDonationAmount(value: string): number {
  const normalized = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
}

export default function DonationFormCard({
  avatarUrl,
  error,
  fieldErrors,
  form,
  onSubmit,
  presetAmounts,
  setForm,
  submitting,
  user,
  username,
}: DonationFormCardProps) {
  return (
    <div className="card" style={{ padding: "2rem" }}>
      <form onSubmit={onSubmit}>
        <DonateProfileHeader avatarUrl={avatarUrl} user={user} username={username} />
        <ErrorAlert message={error} />

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Nama</label>
          <input
            className="input"
            placeholder="Nama kamu"
            value={form.donorName}
            onChange={(e) => setForm({ ...form, donorName: e.target.value })}
            required
            maxLength={100}
          />
          {fieldErrors.donorName && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4 }}>{fieldErrors.donorName}</span>}
        </div>

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Jumlah Donasi</label>
          {presetAmounts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
              {presetAmounts.slice(0, 6).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setForm({ ...form, amount })}
                  style={{
                    padding: "0.75rem",
                    borderRadius: 12,
                    border: form.amount === amount ? "2px solid var(--color-primary)" : "1px solid rgba(255,255,255,0.15)",
                    background: form.amount === amount ? "var(--color-primary)" : "rgba(255,255,255,0.05)",
                    color: form.amount === amount ? "white" : "var(--color-text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: form.amount === amount ? "0 4px 14px var(--color-primary-dark, rgba(99,102,241,0.4))" : "none",
                  }}
                >
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>
          )}
          <input
            className="input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={user.min_amount || 1000}
            max={user.max_amount || 10000000}
            value={form.amount === 0 ? "" : String(form.amount)}
            onChange={(e) => setForm({ ...form, amount: parseDonationAmount(e.target.value) })}
            required
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: "0.75rem", color: fieldErrors.amount ? "#f87171" : "var(--color-text-muted)" }}>
              {fieldErrors.amount || `Min. ${formatRupiah(user.min_amount || 1000)}`}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Maks. {formatRupiah(user.max_amount || 10000000)}</span>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Email</label>
          <input className="input" type="email" placeholder="email@kamu.com" value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} maxLength={255} required />
          {fieldErrors.donorEmail && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4 }}>{fieldErrors.donorEmail}</span>}
        </div>

        <div className="input-group" style={{ marginBottom: "1.5rem" }}>
          <label>Pesan <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(opsional)</span></label>
          <textarea className="input" placeholder="Tulis pesan untuk streamer..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={250} rows={3} style={{ resize: 'none' }} />
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right", display: "block", marginTop: 4 }}>{form.message.length}/250</span>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Memproses..." : `💜 Donasi ${formatRupiah(form.amount)}`}
        </button>
      </form>
    </div>
  );
}
