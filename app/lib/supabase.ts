"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a Supabase client configured to use cookies for auth
export const createClient = () =>  createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});

export const supabase = createClient();
