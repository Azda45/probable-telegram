"use client";

import { useState, useEffect } from "react";
import AdminOverviewTab from "@/fe/admin/components/AdminOverviewTab";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(res => res.json()),
      fetch("/api/admin/analytics").then(res => res.json())
    ]).then(([statsData, analyticsData]) => {
      if (!statsData.error) setStats(statsData);
      if (!analyticsData.error && Array.isArray(analyticsData)) setAnalytics(analyticsData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-700 rounded"></div><div className="h-4 bg-slate-700 rounded w-5/6"></div></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      {stats && <AdminOverviewTab stats={stats} analytics={analytics} />}
    </div>
  );
}
