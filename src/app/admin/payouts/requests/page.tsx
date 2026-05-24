"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminPayoutsTab from "@/fe/admin/components/AdminPayoutsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

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
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setPayouts(payouts.filter(p => p.id !== id));
        toast.success(action === "approve" ? "Penarikan disetujui." : "Penarikan ditolak.");
      } else {
        const data = await res.json();
        toast.error(data.error || `Gagal ${action === "approve" ? "menyetujui" : "menolak"} penarikan.`);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Permintaan Tarik Dana</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Permintaan Tarik Dana</h1>
      <AdminPayoutsTab 
        payouts={payouts} 
        title="Penarikan Pending" 
        showActions={true} 
        onApprove={(id) => handleAction(id, "approve")}
        onReject={(id) => handleAction(id, "reject")}
      />
    </div>
  );
}
