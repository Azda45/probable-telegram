"use client";

import { useState, useEffect } from "react";
import AdminReportsTab from "@/fe/admin/components/AdminReportsTab";

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
      } else {
        alert("Gagal mengupdate status laporan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Reports</h1>
      <AdminReportsTab reports={reports} onResolve={handleResolve} />
    </div>
  );
}
