import { Link, useParams } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import ErrorState from '../../components/ui/ErrorState';
import { useRFQ, useRFQCompare } from '../../hooks/useRFQs';
import AmountCell from '../../components/ui/AmountCell';
import { formatDateTime } from '../../lib/utils';

export default function RFQDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useRFQ(id);
  const compare = useRFQCompare(id);

  if (isLoading) return <LoadingSpinner label="Loading RFQ..." />;
  if (error) return <ErrorState message={error.message} />;

  const rfq = data || {};
  const items = rfq.items || [];
  const vendors = rfq.vendors || [];
  const quotations = compare.data?.quotations || compare.data || [];

  return (
    <div>
      <PageHeader
        eyebrow={rfq.rfqNumber || 'RFQ detail'}
        title={rfq.title || 'Request for Quotation'}
        description={rfq.description || 'Detailed RFQ timeline, invited vendors, line items, and quotation comparison.'}
        actions={<Link className="btn-secondary" to="/rfqs">Back to RFQs</Link>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-6">
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Header</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>Status</span><StatusBadge status={rfq.status} /></div>
              <div className="flex items-center justify-between"><span>Deadline</span><span>{formatDateTime(rfq.deadline)}</span></div>
              <div className="flex items-center justify-between"><span>Created by</span><span>{rfq.createdBy?.name || '—'}</span></div>
            </div>
          </div>
          <DataTable
            rows={vendors}
            columns={[
              { key: 'name', header: 'Invited vendor' },
              { key: 'email', header: 'Email' },
              { key: 'quotationStatus', header: 'Quotation status', render: (row) => <StatusBadge status={row.quotationStatus || 'PENDING'} /> },
            ]}
            emptyTitle="No vendors attached"
            emptyMessage="Assign vendors to this RFQ from the procurement team workflow."
          />
        </div>
        <div className="space-y-6">
          <DataTable
            rows={items}
            columns={[
              { key: 'name', header: 'Item' },
              { key: 'description', header: 'Description' },
              { key: 'quantity', header: 'Qty' },
              { key: 'unit', header: 'Unit' },
            ]}
            emptyTitle="No RFQ items"
            emptyMessage="Line items will appear here once configured."
          />
          <DataTable
            rows={quotations}
            columns={[
              { key: 'vendorName', header: 'Vendor', render: (row) => row.vendor?.name || row.vendorName },
              { key: 'deliveryDays', header: 'Delivery days' },
              { key: 'totalAmount', header: 'Total', render: (row) => <AmountCell value={row.totalAmount} /> },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status || (row.isLowestPrice ? 'ACCEPTED' : 'SUBMITTED')} /> },
            ]}
            emptyTitle="No quotations submitted"
            emptyMessage="Vendor responses will populate here for side-by-side review."
          />
        </div>
      </div>
    </div>
  );
}
