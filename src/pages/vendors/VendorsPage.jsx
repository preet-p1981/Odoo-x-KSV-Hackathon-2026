import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useSaveVendor, useVendorStatus, useVendors } from '../../hooks/useVendors';
import { formatDate } from '../../lib/utils';

const initialVendor = { name: '', email: '', phone: '', address: '', category: '', gstNumber: '', status: 'ACTIVE' };

export default function VendorsPage() {
  const [filters, setFilters] = useState({ search: '', category: '', status: '', page: 1, limit: 20 });
  const [editingVendor, setEditingVendor] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const { data, isLoading } = useVendors(filters);
  const saveVendor = useSaveVendor();
  const updateStatus = useVendorStatus();
  const form = useForm({ defaultValues: initialVendor });

  const vendors = useMemo(() => data?.vendors || data?.items || data || [], [data]);

  const openForm = (vendor = null) => {
    setEditingVendor(vendor || {});
    form.reset(vendor || initialVendor);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await saveVendor.mutateAsync({ id: editingVendor?.id, payload: values });
    setEditingVendor(null);
  });

  return (
    <div>
      <PageHeader
        eyebrow="Vendor management"
        title="Vendors"
        description="Track supplier details, category assignments, GST information, status, and engagement quality."
        actions={<button className="btn-primary" onClick={() => openForm()}><Plus size={16} /> Add vendor</button>}
      />

      <div className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input className="field" placeholder="Search vendor" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <input className="field" placeholder="Category" value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))} />
          <select className="field" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="BLACKLISTED">BLACKLISTED</option>
          </select>
          <div className="flex items-center justify-end text-sm text-slate-500">Dense, enterprise-first vendor registry</div>
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rows={vendors}
        emptyTitle="No vendors found"
        emptyMessage="Create your first vendor record or loosen current filters."
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'category', header: 'Category' },
          { key: 'gstNumber', header: 'GST No.' },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'rating', header: 'Rating', render: (row) => `★ ${row.rating || 0}` },
          { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary px-3 py-1" onClick={() => openForm(row)}>Edit</button>
                <button className="btn-secondary px-3 py-1" onClick={() => setStatusTarget(row)}>Change status</button>
              </div>
            ),
          },
        ]}
      />

      {editingVendor !== null ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="panel w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-slate-950">{editingVendor?.id ? 'Edit vendor' : 'Add vendor'}</h3>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              {['name', 'email', 'phone', 'address', 'category', 'gstNumber'].map((field) => (
                <div key={field} className={field === 'address' ? 'md:col-span-2' : ''}>
                  <label className="label">{field}</label>
                  <input className="field" {...form.register(field)} />
                </div>
              ))}
              <div>
                <label className="label">status</label>
                <select className="field" {...form.register('status')}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="BLACKLISTED">BLACKLISTED</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setEditingVendor(null)}>Cancel</button>
                <button className="btn-primary" disabled={saveVendor.isPending}>{saveVendor.isPending ? 'Saving...' : 'Save vendor'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title="Change vendor status"
        message={`Update ${statusTarget?.name || 'vendor'} to BLACKLISTED status?`}
        confirmText="Blacklist vendor"
        tone="danger"
        onCancel={() => setStatusTarget(null)}
        onConfirm={async () => {
          await updateStatus.mutateAsync({ id: statusTarget.id, status: 'BLACKLISTED' });
          setStatusTarget(null);
        }}
      />
    </div>
  );
}
