import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { FiUsers, FiDollarSign, FiTag, FiEye, FiTrendingUp } from 'react-icons/fi';
import KpiCard from '../components/KpiCard';
import ChartCard, { chartTheme } from '../components/ChartCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminStore } from '../store';
import { getAnalytics } from '../adminApi';

const fmtGHS = (n) => `GHS ${Number(n || 0).toLocaleString()}`;
const fmtNum = (n) => Number(n || 0).toLocaleString();

export default function Analytics() {
  const { isDark } = useTheme();
  const { range } = useAdminStore();
  const [data, setData] = useState(null);
  const t = chartTheme(isDark);

  useEffect(() => {
    let active = true;
    getAnalytics(range).then((res) => { if (active) setData(res.data); });
    return () => { active = false; };
  }, [range]);

  if (!data) {
    return <div className="py-20 text-center text-admin-400">Loading analytics…</div>;
  }

  const { kpis } = data;
  const PIE = ['#6366f1', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Users" value={fmtNum(kpis.totalUsers)} delta={6} icon={FiUsers} tone="accent" />
        <KpiCard label="Active Users" value={fmtNum(kpis.activeUsers)} delta={4} icon={FiTrendingUp} tone="emerald" />
        <KpiCard label="New (7d)" value={fmtNum(kpis.newUsers7d)} delta={12} icon={FiUsers} tone="violet" />
        <KpiCard label="MRR" value={fmtGHS(kpis.mrr)} delta={8} icon={FiDollarSign} tone="amber" />
        <KpiCard label="Revenue" value={fmtGHS(kpis.totalRevenue)} delta={9} icon={FiDollarSign} tone="slate" />
        <KpiCard label="Coupon Uses" value={fmtNum(kpis.couponRedemptions)} delta={-3} icon={FiTag} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Signups" subtitle={`Last ${range === '7d' ? 7 : range === '90d' ? 90 : 30} days`}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.signupsSeries} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gSign" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={t.accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${t.grid}`, borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke={t.accent} strokeWidth={2} fill="url(#gSign)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue" subtitle="Daily recognized revenue (GHS)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.revenueSeries} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.emerald} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={t.emerald} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${t.grid}`, borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke={t.emerald} strokeWidth={2} fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Mix" subtitle="Subscribers by plan">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.planMix} dataKey="value" nameKey="plan" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="none">
                {data.planMix.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${t.grid}`, borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Coupon Performance" subtitle="Redemptions by code">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.couponPerformance} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${t.grid}`, borderRadius: 12, fontSize: 12 }} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
              <Bar dataKey="redemptions" fill={t.accent2} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Top Countries" subtitle="Views by region" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.topCountries} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${t.grid}`, borderRadius: 12, fontSize: 12 }} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
              <Bar dataKey="value" fill={t.accent} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="System" subtitle="Resource utilization">
          <div className="space-y-4 py-2">
            <div>
              <div className="flex justify-between text-xs text-admin-500 dark:text-admin-400 mb-1"><span>Storage used</span><span>{Math.round(kpis.storageUsed / (1024 ** 3))} GB</span></div>
              <div className="h-2 rounded-full bg-admin-100 dark:bg-admin-800 overflow-hidden"><div className="h-full bg-accent-500" style={{ width: '62%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-admin-500 dark:text-admin-400 mb-1"><span>File views (period)</span><span>{fmtNum(kpis.fileViews)}</span></div>
              <div className="h-2 rounded-full bg-admin-100 dark:bg-admin-800 overflow-hidden"><div className="h-full bg-violet-500" style={{ width: '78%' }} /></div>
            </div>
            <div className="flex items-center gap-2 pt-2 text-sm text-admin-600 dark:text-admin-300">
              <FiEye className="w-4 h-4 text-accent-500" /> {fmtNum(kpis.fileViews)} total views tracked
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
