"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, UserCheck, Receipt, Percent, TrendingUp } from "lucide-react";

interface AdminOverviewTabProps {
  stats: any;
  analytics: any[];
}

const statCards = [
  { key: "totalUsers", label: "Total Pengguna", icon: Users, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
  { key: "activeUsers", label: "Pengguna Aktif", icon: UserCheck, color: "from-green-500/20 to-green-600/5", iconColor: "text-green-400" },
  { key: "totalDonations", label: "Total Transaksi", icon: Receipt, color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
  { key: "platformFeeAmount", label: "Platform Fee (5%)", icon: Percent, color: "from-yellow-500/20 to-yellow-600/5", iconColor: "text-yellow-400", isCurrency: true },
  { key: "totalRevenue", label: "Total Pendapatan", icon: TrendingUp, color: "from-indigo-500/20 to-indigo-600/5", iconColor: "text-[var(--color-primary)]", isCurrency: true },
];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, iconColor, isCurrency }) => {
          const value = stats[key] || 0;
          return (
            <div key={key} className={`relative overflow-hidden bg-gradient-to-br ${color} border border-[var(--color-border)] p-5 rounded-xl transition-transform hover:scale-[1.02] duration-200`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">{label}</h3>
                <div className={`p-2 rounded-lg bg-[var(--color-surface)]/50 ${iconColor}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${iconColor}`}>
                {isCurrency ? `Rp ${Number(value).toLocaleString("id-ID")}` : Number(value).toLocaleString("id-ID")}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl">
        <h3 className="text-lg font-bold mb-6">Analitik Pendapatan (30 Hari)</h3>
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
                  formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString("id-ID")}`, 'Pendapatan']}
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
              <div className="text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Belum ada data pendapatan dalam 30 hari terakhir.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
