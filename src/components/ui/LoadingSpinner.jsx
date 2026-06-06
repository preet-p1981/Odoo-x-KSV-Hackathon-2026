export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-10 w-10 animate-spin border-2 border-slate-200 border-t-accent" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
