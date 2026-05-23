"use client";

import { useState, useEffect } from "react";
import AdminAuditLogsTab from "@/fe/admin/components/AdminAuditLogsTab";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Audit Log</h1>
      <AdminAuditLogsTab logs={logs} />
    </div>
  );
}
