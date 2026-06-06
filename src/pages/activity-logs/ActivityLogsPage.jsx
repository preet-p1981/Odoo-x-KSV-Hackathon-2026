import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { formatDateTime } from '../../lib/utils';

export default function ActivityLogsPage() {
  const [entity, setEntity] = useState('');
  const { data, isLoading, error } = useActivityLogs(entity ? { entity } : {});
  const rows = data?.logs || data?.items || data || [];

  return (
    <div>
      <PageHeader eyebrow="Audit trail" title="Activity logs" description="Trace operational actions across RFQs, approvals, orders, invoices, and account activity." />
      <div className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select className="field" value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">All entities</option>
            <option value="RFQ">RFQ</option>
            <option value="Approval">Approval</option>
            <option value="PO">PO</option>
            <option value="Invoice">Invoice</option>
          </select>
        </div>
      </div>
      {isLoading ? <LoadingSpinner label="Loading activity feed..." /> : error ? <ErrorState message={error.message} /> : !rows.length ? <EmptyState title="No activity logs" message="Audit events will appear as users interact with the system." /> : (
        <div className="panel p-5">
          <div className="space-y-5">
            {rows.map((item, index) => (
              <div key={item.id || index} className="border-l-2 border-accent pl-4">
                <p className="font-semibold text-slate-900">{item.action || 'SYSTEM_EVENT'}</p>
                <p className="mt-1 text-sm text-slate-500">{item.user?.name || item.userName || 'System'} · {item.entity || 'Entity'} · #{item.entityId || '—'}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{formatDateTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
