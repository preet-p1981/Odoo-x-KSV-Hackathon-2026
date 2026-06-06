import { cn } from '../../lib/utils';

const styles = {
  ACTIVE: 'border-green-700 bg-green-50 text-green-700',
  INACTIVE: 'border-slate-400 bg-slate-100 text-slate-600',
  BLACKLISTED: 'border-red-700 bg-red-50 text-red-700',
  DRAFT: 'border-slate-500 bg-slate-100 text-slate-700',
  PUBLISHED: 'border-blue-700 bg-blue-50 text-blue-700',
  CLOSED: 'border-green-700 bg-green-50 text-green-700',
  CANCELLED: 'border-red-700 bg-red-50 text-red-700',
  SUBMITTED: 'border-blue-700 bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'border-amber-700 bg-amber-50 text-amber-700',
  ACCEPTED: 'border-green-700 bg-green-50 text-green-700',
  REJECTED: 'border-red-700 bg-red-50 text-red-700',
  PENDING: 'border-amber-700 bg-amber-50 text-amber-700',
  APPROVED: 'border-green-700 bg-green-50 text-green-700',
  ISSUED: 'border-blue-700 bg-blue-50 text-blue-700',
  DELIVERED: 'border-green-700 bg-green-50 text-green-700',
  SENT: 'border-blue-700 bg-blue-50 text-blue-700',
  PAID: 'border-green-700 bg-green-50 text-green-700',
  OVERDUE: 'border-red-700 bg-red-50 text-red-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={cn('inline-flex border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em]', styles[status] || 'border-slate-400 bg-slate-100 text-slate-700')}>
      {String(status || 'UNKNOWN').replaceAll('_', ' ')}
    </span>
  );
}
