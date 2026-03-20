'use client';
import React, { Suspense, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from './actions';

const ERROR_MESSAGES: Record<string, string> = { unauthorized: 'You do not have admin access.' };

function LoginForm() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get('error') || '';
  const errorMsg = ERROR_MESSAGES[rawError] || rawError;
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => { signIn(new FormData(e.currentTarget)); });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">V</div>
          <h1 className="text-xl font-bold tracking-tight">Versely Studio</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Admin Panel</p>
        </div>

        <div className="glass p-8 glow">
          <h2 className="text-base font-semibold mb-6">Sign in to continue</h2>

          {errorMsg && (
            <div className="mb-5 rounded-lg bg-[var(--danger-bg)] border border-red-500/20 px-4 py-3 text-sm text-red-400">{errorMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email</label>
              <input type="email" name="email" required autoComplete="email" placeholder="admin@example.com" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Password</label>
              <input type="password" name="password" required autoComplete="current-password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" className="input" />
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary w-full py-2.5">
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <a href="/api/auth/google" className="btn btn-secondary w-full py-2.5">
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Sign in with Google
          </a>
        </div>

        <p className="mt-6 text-center text-[10px] text-[var(--muted)]">Admin access only. Unauthorised access attempts are logged.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
