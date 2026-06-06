import { Link } from 'react-router-dom';
import { useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AmountCell from '../../components/ui/AmountCell';
import { useApprovalAction, useApprovals } from '../../hooks/useApprovals';
import { formatDate } from '../../lib/utils';

export default function ApprovalsPage() {
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState('approve');
  const { data, isLoading } = useApprovals({ status });
  const approve = useApprovalAction('approve');
  const reject = useApprovalAction('reject');
  const approvals = data?.approvals || data?.items || data || [];

  return (
    <div>
      <PageHeader eyebrow="Workflow" title="Approvals" description="Approve or reject shortlisted quotations and trigger downstream purchase order creation." />
      <div className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <div className="md:col-span-2 flex items-center justify-end text-sm text-slate-500">Manager and admin decision queue</div>
        </div>
      </div>
      <DataTable
        loading={isLoading}
        rows={approvals}
        emptyTitle="No approvals in queue"
        emptyMessage="Submitted quotation approval requests will appear here."
        columns={[
          { key: 'id', header: 'Approval ID' },
          { key: 'quotation', header: 'Quotation', render: (row) => row.quotation?.quotationNumber || row.quotationId },
          { key: 'vendor', header: 'Vendor', render: (row) => row.quotation?.vendor?.name || row.vendor?.name || '—' },
          { key: 'amount', header: 'Amount', render: (row) => <AmountCell value={row.quotation?.totalAmount || row.amount} /> },
          { key: 'requestedBy', header: 'Requested by', render: (row) => row.requestedBy?.name || row.createdBy?.name || '—' },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', header: 'Date', render: (row) => formatDate(row.createdAt) },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link className="btn-secondary px-3 py-1" to={`/approvals/${row.id}`}>View</Link>
                {row.status === 'PENDING' ? <>
                  <button className="btn-primary px-3 py-1" onClick={() => { setSelected(row); setDecision('approve'); }}>Approve</button>
                  <button className="btn-danger px-3 py-1" onClick={() => { setSelected(row); setDecision('reject'); }}>Reject</button>
                </> : null}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(selected)}
        title={`${decision === 'approve' ? 'Approve' : 'Reject'} approval request`}
        message={`This will ${decision} approval ${selected?.id || ''} for ${(selected?.quotation?.vendor?.name) || 'the vendor'} and update the workflow.`}
        confirmText={decision === 'approve' ? 'Approve request' : 'Reject request'}
        tone={decision === 'approve' ? 'default' : 'danger'}
        onCancel={() => setSelected(null)}
        onConfirm={async () => {
          const handler = decision === 'approve' ? approve : reject;
          await handler.mutateAsync({ id: selected.id, remarks: decision === 'reject' ? 'Rejected from UI workflow' : 'Approved from UI workflow' });
          setSelected(null);
        }}
      />
    </div>
  );
}
