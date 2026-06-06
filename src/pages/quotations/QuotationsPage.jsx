import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import AmountCell from '../../components/ui/AmountCell';
import { useQuotations, useSaveQuotation } from '../../hooks/useQuotations';
import { formatDate } from '../../lib/utils';

const values = { rfqId: '', vendorId: '', deliveryDays: 0, notes: '', items: [{ name: '', quantity: 1, unitPrice: 0 }] };

export default function QuotationsPage() {
  const [filters, setFilters] = useState({ rfqId: '', vendorId: '', status: '' });
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuotations(filters);
  const saveQuotation = useSaveQuotation();
  const form = useForm({ defaultValues: values });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const quotations = useMemo(() => data?.quotations || data?.items || data || [], [data]);

  const submit = form.handleSubmit(async (payload) => {
    const items = payload.items.map((item) => ({ ...item, totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0) }));
    await saveQuotation.mutateAsync({ ...payload, items, totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0) });
    setOpen(false);
    form.reset(values);
  });

  return (
    <div>
      <PageHeader
        eyebrow="Vendor submissions"
        title="Quotations"
        description="Review submitted quotations, compare total landed price, and capture delivery commitments from suppliers."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Submit quotation</button>}
      />
      <div className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="field" placeholder="RFQ ID" value={filters.rfqId} onChange={(e) => setFilters((p) => ({ ...p, rfqId: e.target.value }))} />
          <input className="field" placeholder="Vendor ID" value={filters.vendorId} onChange={(e) => setFilters((p) => ({ ...p, vendorId: e.target.value }))} />
          <select className="field" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>
      <DataTable
        loading={isLoading}
        rows={quotations}
        emptyTitle="No quotations found"
        emptyMessage="Published RFQs will create quotation opportunities for vendor users."
        columns={[
          { key: 'quotationNumber', header: 'Quotation No.' },
          { key: 'vendor', header: 'Vendor', render: (row) => row.vendor?.name || row.vendorName || row.vendorId },
          { key: 'rfq', header: 'RFQ', render: (row) => row.rfq?.title || row.rfqTitle || row.rfqId },
          { key: 'totalAmount', header: 'Total amount', render: (row) => <AmountCell value={row.totalAmount} /> },
          { key: 'deliveryDays', header: 'Delivery days' },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', header: 'Date', render: (row) => formatDate(row.createdAt) },
        ]}
      />

      {open ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/50 p-4">
          <div className="mx-auto mt-8 max-w-4xl panel p-6">
            <h3 className="text-xl font-bold">Submit quotation</h3>
            <form className="mt-5 space-y-5" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="label">RFQ ID</label><input className="field" {...form.register('rfqId')} /></div>
                <div><label className="label">Vendor ID</label><input className="field" {...form.register('vendorId')} /></div>
                <div><label className="label">Delivery days</label><input type="number" className="field" {...form.register('deliveryDays', { valueAsNumber: true })} /></div>
                <div className="md:col-span-2"><label className="label">Notes</label><textarea className="field min-h-24" {...form.register('notes')} /></div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="label !mb-0">Line items</label>
                  <button type="button" className="btn-secondary" onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}>Add line</button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 border border-border p-3 md:grid-cols-4">
                      <input className="field" placeholder="Name" {...form.register(`items.${index}.name`)} />
                      <input type="number" className="field" placeholder="Qty" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                      <input type="number" className="field" placeholder="Unit price" {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
                      <button type="button" className="btn-danger" onClick={() => remove(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn-primary" disabled={saveQuotation.isPending}>{saveQuotation.isPending ? 'Saving...' : 'Submit quotation'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
