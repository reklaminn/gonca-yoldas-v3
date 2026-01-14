import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUG: Ortam değişkenlerini kontrol et
console.log('🔌 [Supabase] Client başlatılıyor...');
console.log('🔌 [Supabase] URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'TANIMSIZ');
console.log('🔌 [Supabase] Key:', supabaseAnonKey ? 'Mevcut (Gizli)' : 'TANIMSIZ');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Kritik Hata: Ortam değişkenleri eksik!');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-jlwsapdvizzriomadhxj-auth-token',
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-application-name': 'gonca-yoldas-blog' },
    // ✅ REMOVED: Fetch wrapper that was removing AbortController signal
    // This was causing "signal is aborted without reason" errors during uploads
  },
  // 🆕 REALTIME OPTIONS - Gereksiz bağlantıları önle
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Bağlantı testi fonksiyonu
export const checkConnection = async () => {
  console.log('🔌 [Supabase] Bağlantı testi başlatılıyor...');
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('blog_posts').select('count', { count: 'exact', head: true });
    const duration = Date.now() - start;
    
    if (error) {
      console.error('❌ [Supabase] Bağlantı testi başarısız:', error.message, error.details);
      return false;
    }
    
    console.log(`✅ [Supabase] Bağlantı başarılı! (${duration}ms)`);
    return true;
  } catch (err) {
    console.error('❌ [Supabase] Bağlantı testi sırasında beklenmeyen hata:', err);
    return false;
  }
};
