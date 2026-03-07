"use client";

import { createBrowserClient } from '@supabase/ssr';

// Create a Supabase client configured to use cookies for auth
export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
