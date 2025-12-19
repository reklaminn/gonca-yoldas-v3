import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Client'ı oluştururken en sade haliyle oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  }
});

// Test fonksiyonunu sadece geliştirme ortamında veya manuel çağrıldığında çalışacak şekilde bırakabiliriz
// Ancak üretim hatasını önlemek için top-level (en üst seviye) çalıştırmıyoruz.
