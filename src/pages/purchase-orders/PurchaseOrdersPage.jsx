import { Link } from 'react-router-dom';
import { useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import AmountCell from '../../components/ui/AmountCell';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { formatDate } from '../../lib/utils';

export default function PurchaseOrdersPage() {
  const [params, setParams] = useState({});
  const { data, isLoading } = usePurchaseOrders(params);
  const rows = data?.purchaseOrders || data?.items || data || [];

  return (
    <div>
      <PageHeader eyebrow="Order execution" title="Purchase orders" description="Track issued orders, landed tax totals, and downstream fulfillment status changes." />
      <div className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="field" placeholder="Search PO number or vendor" onChange={(e) => setParams({ search: e.target.value })} />
          <div className="flex items-center justify-end text-sm text-slate-500">PDF download and fulfillment tracking</div>
        </div>
      </div>
      <DataTable
        loading={isLoading}
        rows={rows}
        emptyTitle="No purchase orders"
        emptyMessage="Approving quotations auto-creates purchase orders in the backend workflow."
        columns={[
          { key: 'poNumber', header: 'PO Number' },
          { key: 'vendor', header: 'Vendor', render: (row) => row.vendor?.name || '—' },
          { key: 'totalAmount', header: 'Total', render: (row) => <AmountCell value={row.totalAmount} /> },
          { key: 'taxAmount', header: 'Tax', render: (row) => <AmountCell value={row.taxAmount} /> },
          { key: 'grandTotal', header: 'Grand total', render: (row) => <AmountCell value={row.grandTotal} /> },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
          { key: 'actions', header: 'Actions', render: (row) => <Link className="btn-secondary px-3 py-1" to={`/purchase-orders/${row.id}`}>View</Link> },
        ]}
      />
    </div>
  );
}
