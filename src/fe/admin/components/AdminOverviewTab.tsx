"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminOverviewTabProps {
  stats: any;
  analytics: any[];
}

export default function AdminOverviewTab({ stats, analytics }: AdminOverviewTabProps) {
  const chartData = useMemo(() => {
    return analytics.map(a => ({
      date: new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      revenue: a.revenue,
      count: a.count
    }));
  }, [analytics]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl">
          <h3 className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl">
          <h3 className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl">
          <h3 className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Transactions</h3>
          <p className="text-2xl font-bold">{stats.totalDonations}</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl">
          <h3 className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Platform Fee (5%)</h3>
          <p className="text-2xl font-bold text-yellow-400">
            Rp {(stats.platformFeeAmount || 0).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl">
          <h3 className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">Gross Revenue</h3>
          <p className="text-2xl font-bold text-[var(--color-primary)]">
            Rp {(stats.totalRevenue || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl">
        <h3 className="text-lg font-bold mb-6">Revenue Analytics (30 Days)</h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-text-muted)" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="var(--color-text-muted)" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rp${(val/1000)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                  formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString("id-ID")}`, 'Revenue']}
                  labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
              No revenue data in the last 30 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
