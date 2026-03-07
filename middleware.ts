import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Build a Supabase client that can read/refresh the session cookie
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write updated cookies to both the request and response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (rotates token if expired)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';

  // Not authenticated → redirect to login
  if (!user) {
    if (!isLoginPage) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Authenticated but not admin → sign out and redirect to login with error
  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const isAdmin =
    user.app_metadata?.role === 'admin' ||
    user.app_metadata?.is_admin === true ||
    adminIds.includes(user.id);

  if (!isAdmin) {
    // Sign them out so they can't loop back in
    await supabase.auth.signOut();
    const loginUrl = new URL('/login?error=unauthorized', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated admin on login page → send to dashboard
  if (isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals, static files, API routes, and OAuth callback
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
};
