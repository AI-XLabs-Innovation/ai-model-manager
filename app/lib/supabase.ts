import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side only Supabase client.
 * Auth state is stored in httpOnly cookies — the anon key never reaches the browser.
 */
export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component context where cookies cannot be set.
            // The middleware will handle refreshing the session.
          }
        },
      },
    }
  );
};
