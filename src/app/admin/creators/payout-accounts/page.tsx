"use client";

import { useState, useEffect } from "react";
import AdminPayoutAccountsTab from "@/fe/admin/components/AdminPayoutAccountsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

export default function AdminCreatorPayoutAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Re-use the balances endpoint since it returns all user data including bank_name and bank_account
    fetch("/api/admin/balances?status=payout_accounts")
      .then(res => res.json())
      .then(data => {
        if (data.balances) setAccounts(data.balances);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Akun Payout</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Akun Payout</h1>
      <AdminPayoutAccountsTab accounts={accounts} />
    </div>
  );
}
