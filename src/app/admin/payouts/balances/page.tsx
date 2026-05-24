"use client";

import { useState, useEffect } from "react";
import AdminBalancesTab from "@/fe/admin/components/AdminBalancesTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

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
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Saldo Creator</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Saldo Creator</h1>
      <AdminBalancesTab balances={balances} />
    </div>
  );
}
