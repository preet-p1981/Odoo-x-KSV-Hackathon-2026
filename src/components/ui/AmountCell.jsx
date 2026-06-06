import { formatCurrency } from '../../lib/utils';

export default function AmountCell({ value }) {
  return <span className="font-mono text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>;
}
