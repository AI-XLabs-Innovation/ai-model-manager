import { supabase } from './supabase';

/**
 * Get authentication headers with Bearer token for API requests
 * @returns Headers object with Authorization Bearer token
 */
export const getAuthHeaders = async (): Promise<{ Authorization?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`
      };
    }
    return {};
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {};
  }
};

/**
 * Get authentication headers with content type for API requests
 * @param contentType - Content-Type header value
 * @returns Headers object with Authorization Bearer token and Content-Type
 */
export const getAuthHeadersWithContentType = async (
  contentType: string = 'application/json'
): Promise<{ Authorization?: string; 'Content-Type': string }> => {
  const authHeaders = await getAuthHeaders();
  return {
    ...authHeaders,
    'Content-Type': contentType
  };
};

/**
 * Get current auth token
 * @returns Auth token string or null
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
