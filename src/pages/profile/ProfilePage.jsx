import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/ui/PageHeader';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const form = useForm({ defaultValues: { name: '', email: '', password: '' } });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/auth/me');
        form.reset({ name: data?.data?.name || '', email: data?.data?.email || '', password: '' });
      } catch {
        form.reset({ name: user?.name || '', email: user?.email || '', password: '' });
      }
    };
    load();
  }, [form, user]);

  const submit = form.handleSubmit(async (payload) => {
    setMessage('');
    setError('');
    try {
      await api.put('/auth/me', payload);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile" description="Manage your user identity, email address, and password. Role assignments remain read-only." />
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current role</p>
          <p className="mt-3 inline-flex border border-border bg-slate-50 px-3 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">{user?.role || 'Authenticated user'}</p>
        </div>
        <form className="panel p-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="field" {...form.register('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="field" {...form.register('email')} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Password</label>
              <input type="password" className="field" placeholder="Leave blank to keep existing password" {...form.register('password')} />
            </div>
          </div>
          {message ? <p className="mt-4 border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}
          {error ? <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div className="mt-5 flex justify-end"><button className="btn-primary">Save profile</button></div>
        </form>
      </div>
    </div>
  );
}
