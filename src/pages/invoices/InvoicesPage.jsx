import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useCreateInvoice, useInvoices } from '../../hooks/useInvoices';
import { formatDate } from '../../lib/utils';

export default function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useInvoices();
  const createInvoice = useCreateInvoice();
  const form = useForm({ defaultValues: { purchaseOrderId: '', dueDate: '' } });
  const rows = useMemo(() => data?.invoices || data?.items || data || [], [data]);

  const submit = form.handleSubmit(async (payload) => {
    await createInvoice.mutateAsync(payload);
    setOpen(false);
    form.reset({ purchaseOrderId: '', dueDate: '' });
  });

  return (
    <div>
      <PageHeader eyebrow="Billing" title="Invoices" description="Generate invoices from issued or delivered purchase orders, manage payment status, and send PDFs by email." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Create invoice</button>} />
      <DataTable
        loading={isLoading}
        rows={rows}
        emptyTitle="No invoices"
        emptyMessage="Create an invoice from an issued purchase order to begin billing."
        columns={[
          { key: 'invoiceNumber', header: 'Invoice No.' },
          { key: 'po', header: 'PO No.', render: (row) => row.purchaseOrder?.poNumber || row.purchaseOrderId },
          { key: 'vendor', header: 'Vendor', render: (row) => row.purchaseOrder?.vendor?.name || row.vendor?.name || '—' },
          { key: 'dueDate', header: 'Due date', render: (row) => formatDate(row.dueDate) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'actions', header: 'Actions', render: (row) => <Link className="btn-secondary px-3 py-1" to={`/invoices/${row.id}`}>View</Link> },
        ]}
      />
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="panel w-full max-w-lg p-6">
            <h3 className="text-xl font-bold">Create invoice</h3>
            <form className="mt-5 space-y-4" onSubmit={submit}>
              <div><label className="label">Purchase order ID</label><input className="field" {...form.register('purchaseOrderId')} /></div>
              <div><label className="label">Due date</label><input type="date" className="field" {...form.register('dueDate')} /></div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn-primary" disabled={createInvoice.isPending}>{createInvoice.isPending ? 'Creating...' : 'Create invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
