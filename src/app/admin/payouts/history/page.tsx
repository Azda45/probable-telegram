"use client";

import { useState, useEffect } from "react";
import AdminPayoutsTab from "@/fe/admin/components/AdminPayoutsTab";

export default function AdminPayoutHistoryPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch all for history, or we could fetch approved/rejected
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
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Riwayat Withdraw</h1>
      <AdminPayoutsTab 
        payouts={payouts} 
        title="Payout History" 
        showActions={false} 
      />
    </div>
  );
}
