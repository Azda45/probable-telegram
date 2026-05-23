"use client";

import { useState, useEffect } from "react";
import AdminPayoutsTab from "@/fe/admin/components/AdminPayoutsTab";

export default function AdminPayoutRequestsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = () => {
    setLoading(true);
    fetch("/api/admin/payouts?status=pending")
      .then(res => res.json())
      .then(data => {
        if (data.payouts) setPayouts(data.payouts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this payout?`)) return;

    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setPayouts(payouts.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} payout`);
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Request Withdraw</h1>
      <AdminPayoutsTab 
        payouts={payouts} 
        title="Pending Payouts" 
        showActions={true} 
        onApprove={(id) => handleAction(id, "approve")}
        onReject={(id) => handleAction(id, "reject")}
      />
    </div>
  );
}
