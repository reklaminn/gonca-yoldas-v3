import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Session URL'den algılansın
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-jlwsapdvizzriomadhxj-auth-token',
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  }
});

// Debug: Session durumunu kontrol et
if (typeof window !== 'undefined') {
  const storedSession = localStorage.getItem('sb-jlwsapdvizzriomadhxj-auth-token');
  console.log('🔑 [SupabaseClient] Stored session exists:', !!storedSession);
  if (storedSession) {
    try {
      const parsed = JSON.parse(storedSession);
      console.log('🔑 [SupabaseClient] Session expires at:', parsed?.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A');
    } catch (e) {
      console.warn('🔑 [SupabaseClient] Could not parse stored session');
    }
  }
}
