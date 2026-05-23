"use client";

import { useState, useEffect } from "react";
import AdminOverlayCreatorsTab from "@/fe/admin/components/AdminOverlayCreatorsTab";

export default function AdminOverlayCreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Re-use users endpoint to get creators and their overlay tokens
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) setCreators(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleResetToken = async (userId: string) => {
    if (!confirm(`Reset Overlay Token untuk kreator ini? Ini akan memutus koneksi overlay mereka di OBS/XSplit saat ini.`)) return;

    try {
      const res = await fetch(`/api/admin/overlay/reset/${userId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setCreators(creators.map(c => c.id === userId ? { ...c, overlay_token: data.token } : c));
        alert("Overlay token berhasil direset!");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mereset token");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overlay Creator</h1>
      <AdminOverlayCreatorsTab creators={creators} onResetToken={handleResetToken} />
    </div>
  );
}
