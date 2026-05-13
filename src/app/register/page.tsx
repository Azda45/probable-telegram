"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthFormLayout from "@/components/AuthFormLayout";
import ErrorAlert from "@/components/ErrorAlert";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Buat Akun Baru"
      subtitle="Mulai terima donasi dalam hitungan menit"
      footerText="Sudah punya akun?"
      footerLinkText="Masuk di sini"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit}>
        <ErrorAlert message={error} />

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Nama Tampilan</label>
          <input
            className="input"
            type="text"
            placeholder="John Doe"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Username</label>
          <input
            className="input"
            type="text"
            placeholder="johndoe"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
              })
            }
            required
            minLength={3}
            maxLength={30}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Link donasi: donasiku.com/<strong>{form.username || "username"}</strong>
          </span>
        </div>

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="john@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: "1.5rem" }}>
          <label>Password</label>
          <input
            className="input"
            type="password"
            placeholder="Minimal 6 karakter"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%", padding: "0.875rem" }}
        >
          {loading ? "Mendaftarkan..." : "🚀 Daftar Sekarang"}
        </button>
      </form>
    </AuthFormLayout>
  );
}
