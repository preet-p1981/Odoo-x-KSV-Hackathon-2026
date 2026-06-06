import { formatCurrency, formatNumber } from '../../lib/utils';

export default function StatCard({ label, value, accent = 'text-slate-900', type = 'number' }) {
  const formatted = type === 'currency' ? formatCurrency(value) : formatNumber(value);
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 font-mono text-3xl font-bold ${accent}`}>{formatted}</p>
    </div>
  );
}
