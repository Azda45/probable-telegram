"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ErrorAlert from "@/components/ErrorAlert";
import { formatRupiah } from "@/lib/utils";
import { createRealtimeSocket, type RealtimeClientSocket } from "@/lib/realtime/socket-client";
import { REALTIME_EVENTS, type PaymentStatusPayload, type RealtimeEvent } from "@/lib/realtime/events";

interface UserInfo {
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  min_amount: number;
  max_amount: number;
}

type Stage = "form" | "qr" | "success";

export default function DonatePage() {
  const params = useParams();
  const username = params?.username as string;

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    amount: 10000,
    message: "",
  });

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    donorName?: string;
    amount?: string;
    donorEmail?: string;
  }>({});

  const [qrData, setQrData] = useState<{
    orderId: string;
    qrUrl: string;
    deeplinkUrl: string | null;
    amount: number;
  } | null>(null);

  const socketRef = useRef<RealtimeClientSocket | null>(null);

  // Fetch user info
  useEffect(() => {
    fetch(`/api/donate/user?username=${username}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setUser(data.user);
        setForm((f) => ({ ...f, amount: data.user.min_amount || 10000 }));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  // Preset amounts filtered to fit within user's min/max
  const presetAmounts = user
    ? [5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000].filter(
      (amt) => amt >= user.min_amount && amt <= user.max_amount
    )
    : [];

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const checkPaymentStatusOnce = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/donate/${orderId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.paid) {
        setStage("success");
      }
    } catch {
      // Websocket is primary; one-shot recovery failure is non-fatal.
    }
  }, []);

  useEffect(() => {
    if (stage !== "qr" || !qrData?.orderId) return;

    let disposed = false;
    let socket: RealtimeClientSocket | null = null;

    const handleStatus = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.PAYMENT_STATUS_CHANGED>;
      const payload = realtimeEvent?.payload as PaymentStatusPayload | undefined;
      if (!payload || payload.orderId !== qrData.orderId) return;

      if (payload.paid) {
        setStage("success");
      }
    };

    createRealtimeSocket()
      .then((client) => {
        if (disposed) {
          client.disconnect();
          return;
        }

        socket = client;
        socketRef.current = client;
        client.on("connect", () => {
          client.emit("payment:join", { orderId: qrData.orderId });
          checkPaymentStatusOnce(qrData.orderId);
        });
        client.on(REALTIME_EVENTS.PAYMENT_STATUS_CHANGED, handleStatus);
        if (client.connected) {
          client.emit("payment:join", { orderId: qrData.orderId });
          checkPaymentStatusOnce(qrData.orderId);
        }
      })
      .catch((error) => {
        console.warn("Realtime payment status unavailable; one-shot status checks remain:", error);
      });

    return () => {
      disposed = true;
      if (socket) {
        socket.off(REALTIME_EVENTS.PAYMENT_STATUS_CHANGED, handleStatus);
        socket.disconnect();
      }
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [stage, qrData?.orderId, checkPaymentStatusOnce]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // ── Client-side validation ──
    const newErrors: typeof fieldErrors = {};
    if (!form.donorName.trim()) newErrors.donorName = "Nama wajib diisi";
    else if (form.donorName.trim().length < 2) newErrors.donorName = "Nama minimal 2 karakter";

    const minAmt = user?.min_amount || 1000;
    const maxAmt = user?.max_amount || 10000000;
    if (!form.amount || form.amount < minAmt) {
      newErrors.amount = `Minimal donasi ${formatRupiah(minAmt)}`;
    } else if (form.amount > maxAmt) {
      newErrors.amount = `Maksimal donasi ${formatRupiah(maxAmt)}`;
    } else if (!Number.isInteger(form.amount)) {
      newErrors.amount = "Jumlah harus bilangan bulat";
    }

    if (!form.donorEmail.trim()) {
      newErrors.donorEmail = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail)) {
      newErrors.donorEmail = "Format email tidak valid";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/donate", {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQrData({
        orderId: data.donation.orderId,
        qrUrl: data.donation.qrUrl,
        deeplinkUrl: data.donation.deeplinkUrl,
        amount: Math.floor(form.amount),
      });
      setStage("qr");
      checkPaymentStatusOnce(data.donation.orderId);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="shimmer" style={{ width: 200, height: 24, borderRadius: 8 }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😿</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>User Tidak Ditemukan</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>Username <strong>@{username}</strong> tidak terdaftar</p>
        </div>
      </div>
    );
  }

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
        {/* Form Stage */}
        {stage === "form" && (
          <div className="card" style={{ padding: "2rem" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--color-surface-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    margin: "0 auto 1rem",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  {user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontWeight: 800 }}>{user?.display_name?.charAt(0)?.toUpperCase() || "?"}</span>
                  )}
                </div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {user?.display_name}
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>@{username}</p>
              </div>

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
                {fieldErrors.donorName && (
                  <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4 }}>{fieldErrors.donorName}</span>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                <label>Jumlah Donasi</label>
                {presetAmounts.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    {presetAmounts.slice(0, 6).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setForm({ ...form, amount: amt })}
                        style={{
                          padding: "0.75rem",
                          borderRadius: 12,
                          border: "1px solid var(--color-border)",
                          background: form.amount === amt ? "var(--color-primary)" : "var(--color-surface-elevated)",
                          color: form.amount === amt ? "white" : "var(--color-text-secondary)",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  className="input"
                  type="number"
                  min={user?.min_amount || 1000}
                  max={user?.max_amount || 10000000}
                  step={1000}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                  required
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: "0.75rem", color: fieldErrors.amount ? "#f87171" : "var(--color-text-muted)" }}>
                    {fieldErrors.amount || `Min. ${formatRupiah(user?.min_amount || 1000)}`}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Maks. {formatRupiah(user?.max_amount || 10000000)}
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="email@kamu.com"
                  value={form.donorEmail}
                  onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
                  maxLength={255}
                  required
                />
                {fieldErrors.donorEmail && (
                  <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4 }}>{fieldErrors.donorEmail}</span>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label>Pesan <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(opsional)</span></label>
                <textarea
                  className="input"
                  placeholder="Tulis pesan untuk streamer..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={500}
                  rows={3}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right", display: "block", marginTop: 4 }}>
                  {form.message.length}/500
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                style={{ width: "100%" }}
              >
                {submitting ? "Memproses..." : `💜 Donasi ${formatRupiah(form.amount)}`}
              </button>
            </form>
          </div>
        )}

        {/* QR Stage */}
        {stage === "qr" && qrData && (
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Scan QR untuk Bayar</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Gunakan aplikasi e-wallet atau mobile banking
            </p>

            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "1.5rem",
                display: "inline-block",
                marginBottom: "1.5rem",
                boxShadow: "0 0 30px rgba(139,92,246,0.2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrData.qrUrl} alt="QR Code" style={{ width: 220, height: 220 }} />
            </div>

            <div style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }} className="gradient-text">
              {formatRupiah(qrData.amount)}
            </div>

            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
              Menunggu pembayaran...
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                background: "rgba(245,158,11,0.1)",
                borderRadius: 10,
                fontSize: "0.8125rem",
                color: "#fbbf24",
              }}
            >
              <div className="shimmer" style={{ width: 8, height: 8, borderRadius: "50%" }} />
              Menunggu pembayaran dari QRIS...
            </div>

            {qrData.deeplinkUrl && (
              <a
                href={qrData.deeplinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "1rem" }}
              >
                Bayar via GoPay App
              </a>
            )}

            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                setStage("form");
              }}
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* Success Stage */}
        {stage === "success" && (
          <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Terima Kasih!</h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
              Donasi kamu sebesar{" "}
              <strong className="gradient-text">{formatRupiah(qrData?.amount || 0)}</strong>{" "}
              berhasil dikirim ke <strong>{user?.display_name}</strong>
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setStage("form");
                setForm({ donorName: form.donorName, donorEmail: form.donorEmail, amount: user?.min_amount || 10000, message: "" });
              }}
            >
              💜 Donasi Lagi
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/" className="nav-brand" style={{ fontSize: "0.875rem" }}>
            💜 DonasiKu
          </Link>
        </div>
      </div>
    </div>
  );
}
