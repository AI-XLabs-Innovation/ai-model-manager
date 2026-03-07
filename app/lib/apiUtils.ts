/**
 * Get authentication headers for backend API requests.
 * Fetches the session token from the server via /api/session
 * so the Supabase anon key is never exposed to the browser.
 */
export const getAuthHeaders = async (): Promise<{ Authorization?: string }> => {
  try {
    const res = await fetch('/api/session', { cache: 'no-store' });
    if (!res.ok) return {};
    const { token } = await res.json();
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  } catch {
    return {};
  }
};

/**
 * Get authentication headers with a Content-Type header.
 */
export const getAuthHeadersWithContentType = async (
  contentType: string = 'application/json'
): Promise<{ Authorization?: string; 'Content-Type': string }> => {
  const authHeaders = await getAuthHeaders();
  return { ...authHeaders, 'Content-Type': contentType };
};

/**
 * Get current auth token string, or null if not authenticated.
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const res = await fetch('/api/session', { cache: 'no-store' });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  } catch {
    return null;
  }
};

