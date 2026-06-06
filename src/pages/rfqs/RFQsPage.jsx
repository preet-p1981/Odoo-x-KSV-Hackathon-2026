import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useRFQAction, useRFQs, useSaveRFQ } from '../../hooks/useRFQs';
import { formatDate } from '../../lib/utils';

const baseValues = { title: '', description: '', deadline: '', items: [{ name: '', quantity: 1, unit: 'Nos', description: '' }] };

export default function RFQsPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useRFQs(filters);
  const saveRFQ = useSaveRFQ();
  const publishRFQ = useRFQAction('publish');
  const closeRFQ = useRFQAction('close');
  const form = useForm({ defaultValues: baseValues });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const rfqs = useMemo(() => data?.rfqs || data?.items || data || [], [data]);

  const submit = form.handleSubmit(async (values) => {
    await saveRFQ.mutateAsync({ payload: values });
    setOpen(false);
    form.reset(baseValues);
  });

  return (
    <div>
      <PageHeader
        eyebrow="RFQ module"
        title="Requests for quotation"
        description="Create procurement opportunities, define item lines, and manage vendor engagement windows."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Create RFQ</button>}
      />
      <div className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="field" placeholder="Search title" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select className="field" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <div className="flex items-center justify-end text-sm text-slate-500">Create, publish, close</div>
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rows={rfqs}
        emptyTitle="No RFQs yet"
        emptyMessage="Create a draft RFQ to start procurement activity."
        columns={[
          { key: 'rfqNumber', header: 'RFQ No.' },
          { key: 'title', header: 'Title' },
          { key: 'deadline', header: 'Deadline', render: (row) => formatDate(row.deadline) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'vendorCount', header: 'Vendor count', render: (row) => row.vendorCount || row.vendors?.length || 0 },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link className="btn-secondary px-3 py-1" to={`/rfqs/${row.id}`}>View</Link>
                {row.status === 'DRAFT' ? <button className="btn-primary px-3 py-1" onClick={() => publishRFQ.mutate(row.id)}>Publish</button> : null}
                {row.status === 'PUBLISHED' ? <button className="btn-secondary px-3 py-1" onClick={() => closeRFQ.mutate(row.id)}>Close</button> : null}
              </div>
            ),
          },
        ]}
      />

      {open ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/50 p-4">
          <div className="mx-auto mt-8 max-w-4xl panel p-6">
            <h3 className="text-xl font-bold">Create RFQ</h3>
            <form className="mt-5 space-y-5" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Title</label>
                  <input className="field" {...form.register('title')} />
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input type="datetime-local" className="field" {...form.register('deadline')} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="field min-h-28" {...form.register('description')} />
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="label !mb-0">RFQ items</label>
                  <button type="button" className="btn-secondary" onClick={() => append({ name: '', quantity: 1, unit: 'Nos', description: '' })}>Add row</button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 border border-border p-3 md:grid-cols-5">
                      <input className="field md:col-span-2" placeholder="Item name" {...form.register(`items.${index}.name`)} />
                      <input type="number" className="field" placeholder="Qty" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                      <input className="field" placeholder="Unit" {...form.register(`items.${index}.unit`)} />
                      <div className="flex gap-2 md:col-span-5">
                        <textarea className="field min-h-20 flex-1" placeholder="Description" {...form.register(`items.${index}.description`)} />
                        <button type="button" className="btn-danger h-fit px-3 py-2" onClick={() => remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn-primary" disabled={saveRFQ.isPending}>{saveRFQ.isPending ? 'Saving...' : 'Create draft RFQ'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
