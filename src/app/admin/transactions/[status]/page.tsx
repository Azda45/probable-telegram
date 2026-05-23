"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AdminTransactionsTab from "@/fe/admin/components/AdminTransactionsTab";

export default function AdminTransactionsPage() {
  const params = useParams();
  const statusParam = (params?.status as string) || "all";
  
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Map route param to actual DB status
  const dbStatusMap: Record<string, string> = {
    "all": "all",
    "pending": "pending",
    "success": "settlement",
    "failed": "failure",
    "refund": "refund"
  };

  const statusQuery = dbStatusMap[statusParam] || "all";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/donations?status=${statusQuery}`)
      .then(res => res.json())
      .then(data => {
        if (data.donations) setDonations(data.donations);
      })
      .finally(() => setLoading(false));
  }, [statusQuery]);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  const titleMap: Record<string, string> = {
    "all": "Semua Donasi",
    "pending": "Donasi Pending",
    "success": "Donasi Sukses",
    "failed": "Donasi Gagal",
    "refund": "Refund / Dispute",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{titleMap[statusParam] || "Transactions"}</h1>
      <AdminTransactionsTab donations={donations} />
    </div>
  );
}
