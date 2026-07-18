'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, ApiError } from '@/lib/auth-context';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(params.get('redirectTo') || '/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
      {/* Brand panel — signature: a quiet org-chart motif made of dots and connectors */}
      <div className="relative hidden overflow-hidden bg-navy px-12 py-16 text-white lg:col-span-2 lg:flex lg:flex-col lg:justify-between">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]" viewBox="0 0 400 600" fill="none">
          <circle cx="200" cy="90" r="8" fill="white" />
          <line x1="200" y1="98" x2="120" y2="200" stroke="white" strokeWidth="1.5" />
          <line x1="200" y1="98" x2="200" y2="200" stroke="white" strokeWidth="1.5" />
          <line x1="200" y1="98" x2="280" y2="200" stroke="white" strokeWidth="1.5" />
          <circle cx="120" cy="208" r="6" fill="white" />
          <circle cx="200" cy="208" r="6" fill="white" />
          <circle cx="280" cy="208" r="6" fill="white" />
          <line x1="120" y1="214" x2="80" y2="320" stroke="white" strokeWidth="1.5" />
          <line x1="120" y1="214" x2="160" y2="320" stroke="white" strokeWidth="1.5" />
          <line x1="280" y1="214" x2="280" y2="320" stroke="white" strokeWidth="1.5" />
          <circle cx="80" cy="328" r="5" fill="white" />
          <circle cx="160" cy="328" r="5" fill="white" />
          <circle cx="280" cy="328" r="5" fill="white" />
        </svg>
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Employee Management System</p>
          <h1 className="mt-4 max-w-xs font-display text-3xl font-medium leading-tight">
            Every report, every reporting line, in one place.
          </h1>
        </div>
        <p className="relative font-mono text-xs text-white/50">Secure access · role-based · audited</p>
      </div>

      {/* Form panel */}
      <div className="col-span-1 flex items-center justify-center px-6 py-16 lg:col-span-3">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-medium text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink-soft">Use your work email and password.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-rose-light px-3 py-2 text-sm text-rose">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
