import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useProcurementTrend, useSpendingReport, useVendorPerformance } from '../../hooks/useReports';

const tabs = ['Spending', 'Vendor Performance', 'Procurement Trend'];

export default function ReportsPage() {
  const [active, setActive] = useState('Spending');
  const spending = useSpendingReport();
  const vendorPerformance = useVendorPerformance();
  const trend = useProcurementTrend();
  const spendRows = Array.isArray(spending.data) ? spending.data : spending.data?.monthly || [];
  const vendorRows = vendorPerformance.data?.vendors || vendorPerformance.data || [];
  const trendRows = Array.isArray(trend.data) ? trend.data : trend.data?.monthly || [];

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Reports" description="Track spend, supplier performance, and procurement flow conversion over time." actions={<a className="btn-secondary" href="http://localhost:5000/api/reports/export" target="_blank" rel="noreferrer">Export CSV</a>} />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} className={active === tab ? 'btn-primary' : 'btn-secondary'} onClick={() => setActive(tab)}>{tab}</button>
        ))}
      </div>

      {active === 'Spending' ? (
        spending.isLoading ? <LoadingSpinner label="Loading spending report..." /> : (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="panel p-5">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendRows}>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area dataKey="spend" stroke="#2563EB" fill="#93C5FD" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="panel p-5">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendRows}>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#0F1117" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )
      ) : null}

      {active === 'Vendor Performance' ? (
        <DataTable
          loading={vendorPerformance.isLoading}
          rows={vendorRows}
          emptyTitle="No performance metrics"
          emptyMessage="Vendor scorecards will appear when backend analytics data is available."
          columns={[
            { key: 'name', header: 'Vendor name' },
            { key: 'rating', header: 'Rating' },
            { key: 'winRate', header: 'Win rate %' },
            { key: 'onTimeDelivery', header: 'On-time delivery %' },
            { key: 'totalPOs', header: 'Total POs' },
          ]}
        />
      ) : null}

      {active === 'Procurement Trend' ? (
        trend.isLoading ? <LoadingSpinner label="Loading trend report..." /> : (
          <div className="panel p-5">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendRows}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rfqs" stroke="#0F1117" strokeWidth={3} />
                  <Line type="monotone" dataKey="pos" stroke="#2563EB" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
