"use client";

import { useState, useEffect } from "react";
import AdminPayoutAccountsTab from "@/fe/admin/components/AdminPayoutAccountsTab";

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
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Payout Accounts</h1>
      <AdminPayoutAccountsTab accounts={accounts} />
    </div>
  );
}
