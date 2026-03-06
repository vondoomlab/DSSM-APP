import { supabase } from './supabase';

/**
 * Authenticated fetch — automatically adds Bearer token to every API request.
 * Drop-in replacement for fetch() for all /api/* calls.
 */
export async function apiFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
