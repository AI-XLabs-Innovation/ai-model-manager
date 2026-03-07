import { createClient } from '../../lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/session
 * Returns the current session's access_token from the server-side cookie.
 * Client components call this to get the JWT for backend API calls
 * without ever having direct access to the Supabase anon key.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ token: null }, { status: 401 });
    }

    return NextResponse.json({ token: session.access_token });
  } catch {
    return NextResponse.json({ token: null }, { status: 500 });
  }
}
