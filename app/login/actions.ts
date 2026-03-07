'use server';

import { createClient } from '../lib/supabase';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = (formData.get('email') as string || '').trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(
      '/login?error=' + encodeURIComponent(error?.message || 'Invalid credentials')
    );
  }

  // Verify admin access
  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const isAdmin =
    data.user.app_metadata?.role === 'admin' ||
    data.user.app_metadata?.is_admin === true ||
    adminIds.includes(data.user.id);

  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect('/login?error=' + encodeURIComponent('You do not have admin access'));
  }

  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
