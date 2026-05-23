"use client";

import { useState, useEffect } from "react";
import AdminBalancesTab from "@/fe/admin/components/AdminBalancesTab";

export default function AdminPayoutBalancesPage() {
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/balances")
      .then(res => res.json())
      .then(data => {
        if (data.balances) setBalances(data.balances);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Saldo Creator</h1>
      <AdminBalancesTab balances={balances} />
    </div>
  );
}
