import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/utils';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setError('');
    try {
      const { data } = await api.post('/auth/login', values);
      const token = data?.data?.token || data?.token;
      if (!token) throw new Error('Token missing in response');
      login(token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F16] p-6 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden border border-slate-800 bg-sidebar lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hidden border-r border-slate-800 bg-grain bg-[size:12px_12px] p-10 lg:block">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">VendorBridge</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Industrial clarity for procurement teams.</h1>
          <p className="mt-4 max-w-lg text-sm text-slate-400">Manage vendors, RFQs, quotations, approvals, purchase orders, invoices, and reporting from one dense command center.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
            {['Vendor lifecycle', 'RFQ publishing', 'Approval workflows', 'Spend analytics'].map((item) => (
              <div key={item} className="border border-slate-800 bg-slate-900/70 p-4 text-slate-200">{item}</div>
            ))}
          </div>
        </div>
        <div className="bg-bg p-8 text-slate-900 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Authentication</p>
          <h2 className="mt-2 text-3xl font-bold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your VendorBridge credentials to access the ERP workspace.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="label">Email</label>
              <input className="field" placeholder="you@company.com" {...register('email')} />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="field" placeholder="••••••••" {...register('password')} />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
            </div>
            {error ? <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link className="text-accent hover:underline" to="/forgot-password">Forgot password</Link>
            <span className="text-slate-500">Roles: ADMIN · MANAGER · PROCUREMENT_OFFICER · VENDOR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
