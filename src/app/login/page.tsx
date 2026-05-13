"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthFormLayout from "@/components/AuthFormLayout";
import ErrorAlert from "@/components/ErrorAlert";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
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
      title="Selamat Datang"
      subtitle="Masuk ke akun DonasiKu kamu"
      footerText="Belum punya akun?"
      footerLinkText="Daftar sekarang"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit}>
        <ErrorAlert message={error} />

        <div className="input-group" style={{ marginBottom: "1.25rem" }}>
          <label>Username atau Email</label>
          <input
            className="input"
            type="text"
            placeholder="johndoe atau john@email.com"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: "1.5rem" }}>
          <label>Password</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%", padding: "0.875rem" }}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </AuthFormLayout>
  );
}
