import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import StatusBadge from '../../components/ui/StatusBadge';
import { useInvoice, useInvoiceStatus, useSendInvoiceEmail } from '../../hooks/useInvoices';
import api from '../../lib/axios';
import { formatDate, formatDateTime, getErrorMessage } from '../../lib/utils';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useInvoice(id);
  const updateStatus = useInvoiceStatus();
  const sendEmail = useSendInvoiceEmail();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const form = useForm({ defaultValues: { recipientEmail: '', message: 'Please find attached your VendorBridge invoice PDF.' } });

  if (isLoading) return <LoadingSpinner label="Loading invoice..." />;
  if (error) return <ErrorState message={error.message} />;
  const invoice = data || {};

  const emailSubmit = form.handleSubmit(async (payload) => {
    await sendEmail.mutateAsync({ id, payload });
    setFeedback('Invoice email sent successfully.');
    setOpen(false);
  });

  return (
    <div>
      <PageHeader eyebrow={invoice.invoiceNumber || 'Invoice'} title="Invoice detail" description="Billing summary, linked purchase order, payment status transitions, and vendor email dispatch." actions={<Link className="btn-secondary" to="/invoices">Back</Link>} />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Invoice summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>Status</span><StatusBadge status={invoice.status} /></div>
              <div className="flex items-center justify-between"><span>PO</span><span>{invoice.purchaseOrder?.poNumber || '—'}</span></div>
              <div className="flex items-center justify-between"><span>Vendor</span><span>{invoice.purchaseOrder?.vendor?.name || '—'}</span></div>
              <div className="flex items-center justify-between"><span>Due date</span><span>{formatDate(invoice.dueDate)}</span></div>
              <div className="flex items-center justify-between"><span>Sent at</span><span>{formatDateTime(invoice.sentAt)}</span></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => updateStatus.mutate({ id, status: 'PAID' })}>Mark paid</button>
              <button className="btn-secondary" onClick={() => updateStatus.mutate({ id, status: 'SENT' })}>Mark sent</button>
              <button className="btn-secondary" onClick={() => setOpen(true)}>Send email</button>
              <button
                className="btn-secondary"
                onClick={async () => {
                  try {
                    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                    window.open(url, '_blank');
                  } catch (err) {
                    setFeedback(getErrorMessage(err));
                  }
                }}
              >Download PDF</button>
            </div>
            {feedback ? <p className="mt-3 text-sm text-slate-500">{feedback}</p> : null}
          </div>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Linked purchase order</p>
          <div className="mt-4 text-sm text-slate-700">
            <p><span className="font-semibold">PO Number:</span> {invoice.purchaseOrder?.poNumber || '—'}</p>
            <p className="mt-2"><span className="font-semibold">Vendor:</span> {invoice.purchaseOrder?.vendor?.name || '—'}</p>
            <p className="mt-2"><span className="font-semibold">Grand Total:</span> {invoice.purchaseOrder?.grandTotal || '—'}</p>
            <p className="mt-2"><span className="font-semibold">Status:</span> {invoice.purchaseOrder?.status || '—'}</p>
          </div>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="panel w-full max-w-xl p-6">
            <h3 className="text-xl font-bold">Send invoice by email</h3>
            <form className="mt-5 space-y-4" onSubmit={emailSubmit}>
              <div><label className="label">Recipient email</label><input className="field" defaultValue={invoice.purchaseOrder?.vendor?.email || ''} {...form.register('recipientEmail')} /></div>
              <div><label className="label">Message</label><textarea className="field min-h-28" {...form.register('message')} /></div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn-primary" disabled={sendEmail.isPending}>{sendEmail.isPending ? 'Sending...' : 'Send email'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
