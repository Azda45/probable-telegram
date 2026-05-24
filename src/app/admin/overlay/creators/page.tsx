"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminOverlayCreatorsTab from "@/fe/admin/components/AdminOverlayCreatorsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

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
    try {
      const res = await fetch(`/api/admin/overlay/reset/${userId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setCreators(creators.map(c => c.id === userId ? { ...c, overlay_token: data.token } : c));
        toast.success("Overlay token berhasil direset!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mereset token.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Kelola Overlay</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kelola Overlay</h1>
      <AdminOverlayCreatorsTab creators={creators} onResetToken={handleResetToken} />
    </div>
  );
}
