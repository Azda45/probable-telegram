"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminReportsTab from "@/fe/admin/components/AdminReportsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/moderation/reports")
      .then(res => res.json())
      .then(data => {
        if (data.reports) setReports(data.reports);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, status } : r));
        toast.success(status === "resolved" ? "Laporan diselesaikan." : "Laporan ditolak.");
      } else {
        toast.error("Gagal mengupdate status laporan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Laporan Pengguna</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Laporan Pengguna</h1>
      <AdminReportsTab reports={reports} onResolve={handleResolve} />
    </div>
  );
}
