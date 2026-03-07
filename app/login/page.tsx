'use client';

import React, { Suspense, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'You do not have admin access.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get('error') || '';
  const errorMsg = ERROR_MESSAGES[rawError] || rawError;

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      signIn(formData);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Versely Studio</h1>
          <p className="mt-1 text-sm text-gray-400">Admin Panel</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-lg font-semibold mb-6">Sign in</h2>

          {errorMsg && (
            <div className="mb-5 rounded-lg border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Admin access only. Unauthorised access attempts are logged.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
