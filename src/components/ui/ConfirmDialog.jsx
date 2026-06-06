export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, confirmText = 'Confirm', tone = 'default' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="panel w-full max-w-md p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confirmation</p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">{title}</h3>
        <p className="mt-3 text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={tone === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
