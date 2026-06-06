import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { getErrorMessage } from '../../lib/utils';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', values);
      setMessage(data?.message || 'Reset instructions have been sent.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="panel w-full max-w-md p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Password reset</p>
        <h1 className="mt-2 text-2xl font-bold">Forgot password</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label">Email</label>
            <input className="field" {...register('email')} />
          </div>
          {message ? <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}
          {error ? <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Send reset link'}</button>
        </form>
        <Link className="mt-4 inline-block text-sm text-accent hover:underline" to="/login">Back to login</Link>
      </div>
    </div>
  );
}
