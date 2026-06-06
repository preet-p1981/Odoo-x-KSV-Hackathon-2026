import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import ErrorState from '../../components/ui/ErrorState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useDashboard, useProcurementTrend, useSpendingReport } from '../../hooks/useReports';
import { formatDateTime } from '../../lib/utils';

const fallbackSpend = [
  { month: 'Jan', spend: 180000 },
  { month: 'Feb', spend: 240000 },
  { month: 'Mar', spend: 210000 },
  { month: 'Apr', spend: 320000 },
  { month: 'May', spend: 275000 },
  { month: 'Jun', spend: 450000 },
];

const fallbackTrend = [
  { month: 'Jan', rfqs: 12, pos: 8 },
  { month: 'Feb', rfqs: 14, pos: 10 },
  { month: 'Mar', rfqs: 18, pos: 12 },
  { month: 'Apr', rfqs: 20, pos: 13 },
  { month: 'May', rfqs: 22, pos: 16 },
  { month: 'Jun', rfqs: 24, pos: 19 },
];

export default function DashboardPage() {
  const dashboard = useDashboard();
  const spending = useSpendingReport();
  const trend = useProcurementTrend();
  const logs = useActivityLogs({ limit: 10 });

  if (dashboard.isLoading) return <LoadingSpinner label="Loading dashboard..." />;
  if (dashboard.error) return <ErrorState message={dashboard.error.message} />;

  const data = dashboard.data || {};
  const spendRows = Array.isArray(spending.data) ? spending.data : spending.data?.monthly || fallbackSpend;
  const trendRows = Array.isArray(trend.data) ? trend.data : trend.data?.monthly || fallbackTrend;
  const topVendors = data.topVendors || [];
  const activityRows = Array.isArray(logs.data) ? logs.data : logs.data?.logs || [];

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Procurement command center" description="Monitor pending approvals, monthly spend, live procurement throughput, and recent activity in one place." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Pending approvals" value={data.pendingApprovals || 0} accent={(data.pendingApprovals || 0) > 0 ? 'text-red-600' : 'text-slate-900'} />
        <StatCard label="Active RFQs" value={data.activeRFQs || 0} accent="text-blue-600" />
        <StatCard label="Recent POs" value={data.recentPOs || 0} accent="text-emerald-600" />
        <StatCard label="Recent invoices" value={data.recentInvoices || 0} accent="text-violet-600" />
        <StatCard label="Spend this month" value={data.totalSpendThisMonth || 0} type="currency" accent="text-slate-950" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Monthly spend</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendRows}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="spend" stroke="#2563EB" fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Procurement trend</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendRows}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rfqs" fill="#0F1117" />
                <Bar dataKey="pos" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTable
          columns={[
            { key: 'name', header: 'Vendor' },
            { key: 'category', header: 'Category' },
            { key: 'rating', header: 'Rating', render: (row) => `★ ${row.rating || 0}` },
            { key: 'totalPOs', header: 'Total POs' },
          ]}
          rows={topVendors}
          emptyTitle="No vendor performance yet"
          emptyMessage="Top vendors will appear after procurement activity begins."
        />

        <div className="panel p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recent activity</p>
            <span className="text-xs text-slate-400">Last 10 events</span>
          </div>
          <div className="mt-4 space-y-4">
            {activityRows.length ? activityRows.map((item, idx) => (
              <div key={item.id || idx} className="border-l-2 border-accent pl-4">
                <p className="text-sm font-semibold text-slate-900">{item.action || 'SYSTEM_EVENT'}</p>
                <p className="mt-1 text-sm text-slate-500">{item.entity || 'Entity'} · {item.user?.name || item.userName || 'System'}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{formatDateTime(item.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No recent activity available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
