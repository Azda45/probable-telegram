"use client";

import { useState, useEffect } from "react";
import AdminOverviewTab from "@/fe/admin/components/AdminOverviewTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

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
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Ringkasan Dashboard</h1>
        <AdminLoadingSkeleton type="cards" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ringkasan Dashboard</h1>
      {stats && <AdminOverviewTab stats={stats} analytics={analytics} />}
    </div>
  );
}
