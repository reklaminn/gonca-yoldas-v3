import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'gonca-yoldas-web',
    },
  },
  db: {
    schema: 'public',
  },
  // Force schema refresh
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Clear any cached schema and test connection
const testConnection = async () => {
  try {
    // Force a fresh query to refresh schema cache
    const { data, error } = await supabase
      .from('general_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connected successfully');
      console.log('📊 Schema columns available:', data ? Object.keys(data[0] || {}) : 'No data');
    }
  } catch (err) {
    console.error('❌ Connection test error:', err);
  }
};

testConnection();
