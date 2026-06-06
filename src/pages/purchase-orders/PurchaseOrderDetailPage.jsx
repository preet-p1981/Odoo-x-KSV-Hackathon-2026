import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import AmountCell from '../../components/ui/AmountCell';
import { usePurchaseOrder, usePurchaseOrderStatus } from '../../hooks/usePurchaseOrders';
import api from '../../lib/axios';
import { formatDateTime, getErrorMessage } from '../../lib/utils';

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = usePurchaseOrder(id);
  const updateStatus = usePurchaseOrderStatus();
  const [info, setInfo] = useState('');

  if (isLoading) return <LoadingSpinner label="Loading purchase order..." />;
  if (error) return <ErrorState message={error.message} />;

  const po = data || {};
  return (
    <div>
      <PageHeader eyebrow={po.poNumber || 'Purchase order'} title="Purchase order detail" description="Review order economics, linked quotation lines, and fulfillment progress." actions={<Link className="btn-secondary" to="/purchase-orders">Back</Link>} />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>Status</span><StatusBadge status={po.status} /></div>
              <div className="flex items-center justify-between"><span>Vendor</span><span>{po.vendor?.name || '—'}</span></div>
              <div className="flex items-center justify-between"><span>Total</span><AmountCell value={po.totalAmount} /></div>
              <div className="flex items-center justify-between"><span>Grand total</span><AmountCell value={po.grandTotal} /></div>
              <div className="flex items-center justify-between"><span>Created</span><span>{formatDateTime(po.createdAt)}</span></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => updateStatus.mutate({ id, status: 'DELIVERED' })}>Mark delivered</button>
              <button
                className="btn-secondary"
                onClick={async () => {
                  try {
                    const response = await api.get(`/purchase-orders/${id}/pdf`, { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                    window.open(url, '_blank');
                  } catch (err) {
                    setInfo(getErrorMessage(err));
                  }
                }}
              >Download PDF</button>
            </div>
            {info ? <p className="mt-3 text-sm text-slate-500">{info}</p> : null}
          </div>
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vendor card</p>
            <div className="mt-4 text-sm text-slate-700">
              <p className="font-semibold">{po.vendor?.name || '—'}</p>
              <p>{po.vendor?.email || '—'}</p>
              <p>{po.vendor?.phone || '—'}</p>
              <p>{po.vendor?.address || '—'}</p>
            </div>
          </div>
        </div>
        <DataTable
          rows={po.quotation?.items || po.items || []}
          emptyTitle="No linked items"
          emptyMessage="Quotation lines will appear here when present in the API response."
          columns={[
            { key: 'name', header: 'Item' },
            { key: 'quantity', header: 'Qty' },
            { key: 'unitPrice', header: 'Unit price', render: (row) => <AmountCell value={row.unitPrice} /> },
            { key: 'totalPrice', header: 'Line total', render: (row) => <AmountCell value={row.totalPrice} /> },
          ]}
        />
      </div>
    </div>
  );
}
