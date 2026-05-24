"use client";

import { useState, useEffect } from "react";
import AdminPayoutsTab from "@/fe/admin/components/AdminPayoutsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

export default function AdminPayoutHistoryPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/payouts?status=all")
      .then(res => res.json())
      .then(data => {
        if (data.payouts) {
          // Filter out pending to only show history
          setPayouts(data.payouts.filter((p: any) => p.status !== 'pending'));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Riwayat Penarikan</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Riwayat Penarikan</h1>
      <AdminPayoutsTab 
        payouts={payouts} 
        title="Riwayat Penarikan" 
        showActions={false} 
      />
    </div>
  );
}
