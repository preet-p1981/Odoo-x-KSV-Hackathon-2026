export default function ErrorState({ title = 'Unable to load data', message = 'Please try again.' }) {
  return (
    <div className="panel p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Error</p>
      <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
