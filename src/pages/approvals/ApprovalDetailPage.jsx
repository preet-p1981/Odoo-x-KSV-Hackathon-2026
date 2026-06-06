import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import StatusBadge from '../../components/ui/StatusBadge';
import AmountCell from '../../components/ui/AmountCell';
import { useApproval } from '../../hooks/useApprovals';
import { formatDateTime } from '../../lib/utils';

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useApproval(id);
  if (isLoading) return <LoadingSpinner label="Loading approval..." />;
  if (error) return <ErrorState message={error.message} />;
  const approval = data || {};
  const quotation = approval.quotation || {};

  return (
    <div>
      <PageHeader eyebrow={`Approval ${approval.id || ''}`} title="Approval detail" description="Quotation context, decision timeline, and stakeholder trail." actions={<Link className="btn-secondary" to="/approvals">Back</Link>} />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Summary</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><span>Status</span><StatusBadge status={approval.status} /></div>
            <div className="flex items-center justify-between"><span>Vendor</span><span>{quotation.vendor?.name || '—'}</span></div>
            <div className="flex items-center justify-between"><span>Quotation</span><span>{quotation.quotationNumber || '—'}</span></div>
            <div className="flex items-center justify-between"><span>Amount</span><AmountCell value={quotation.totalAmount} /></div>
            <div className="flex items-center justify-between"><span>Approver</span><span>{approval.approver?.name || '—'}</span></div>
          </div>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Timeline</p>
          <div className="mt-4 space-y-4">
            {(approval.timeline || [{ label: 'Created', at: approval.createdAt }, { label: approval.status || 'Updated', at: approval.updatedAt }]).map((item, idx) => (
              <div key={idx} className="border-l-2 border-accent pl-4">
                <p className="font-semibold text-slate-900">{item.label || item.status}</p>
                <p className="text-sm text-slate-500">{item.remarks || approval.remarks || 'Workflow event'}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{formatDateTime(item.at || item.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
