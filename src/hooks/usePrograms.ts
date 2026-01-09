import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Program {
  id: number | string;
  slug: string;
  title: string;
  title_tr?: string;
  title_en?: string;
  short_title?: string;
  age?: string;
  age_group?: string;
  age_range?: string;
  description?: string;
  image_url?: string;
  price: number;
  duration?: string;
  schedule?: string;
  lessons_per_week?: number;
  lesson_duration?: string;
  max_students?: number;
  enrolled_students?: number;
  features?: { id: string; feature_text: string }[];
  outcomes?: { id: string; feature_text: string }[];
  faqs?: { id: string; question: string; answer: string }[];
  featured?: boolean;
  status?: 'active' | 'passive' | 'draft';
  iyzilink?: string;
  metadata?: any;
  sendpulse_id?: string;
  sendpulse_upsell_id?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const usePrograms = (statusFilter?: string) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    console.log('🔄 [usePrograms] Programlar getiriliyor...');
    setLoading(true);
    setError(null);

    try {
      let url = `${SUPABASE_URL}/rest/v1/programs?select=*&order=created_at.desc`;
      if (statusFilter) {
         url += `&status=eq.${statusFilter}`;
      }
      // Direkt REST API kullan (daha hızlı ve güvenilir)
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`REST fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Metadata parse et
      const parsedData = data.map((prog: any) => ({
        ...prog,
        metadata: typeof prog.metadata === 'string' ? JSON.parse(prog.metadata) : prog.metadata
      }));

      console.log(`✅ [usePrograms] REST ile yüklendi: ${parsedData?.length || 0} program`);
      setPrograms(parsedData || []);

    } catch (err: any) {
      console.error('❌ [usePrograms] Kritik Hata:', err);
      setError(err.message || 'Programlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return { programs, loading, error, refetch: fetchPrograms };
};

export const useProgramDetails = (slug: string) => {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProgram();
    }
  }, [slug]);

  const fetchProgram = async () => {
    setLoading(true);
    try {
      // Direkt REST API kullan
      const response = await fetch(`${SUPABASE_URL}/rest/v1/programs?slug=eq.${slug}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
          'Accept': 'application/vnd.pgrst.object+json'
        }
      });

      if (!response.ok) throw new Error('REST fetch failed');
      
      const data = await response.json();
      
      // Metadata parse et
      if (data && typeof data.metadata === 'string') {
        data.metadata = JSON.parse(data.metadata);
      }
      
      setProgram(data);

    } catch (err: any) {
      console.error('Error fetching program details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { program, loading, error, refetch: fetchProgram };
};

// CRUD Operations - Helper to get token
const getAccessToken = () => {
  try {
    const storageKey = 'sb-jlwsapdvizzriomadhxj-auth-token';
    const sessionStr = localStorage.getItem(storageKey);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session?.access_token;
    }
  } catch (e) {
    console.warn('Token read failed', e);
  }
  return null;
};

// Helper for write operations via REST (more reliable in this env)
const performWrite = async (method: 'POST' | 'PATCH' | 'DELETE', endpoint: string, body?: any) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const token = getAccessToken();

  if (!token) throw new Error('Oturum bulunamadı');

  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`İşlem başarısız: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createProgram = async (program: Omit<Program, 'id' | 'created_at'>) => {
  const data = await performWrite('POST', 'programs', program);
  return Array.isArray(data) ? data[0] : data;
};

export const updateProgram = async (id: string | number, updates: Partial<Program>) => {
  const data = await performWrite('PATCH', `programs?id=eq.${id}`, updates);
  return Array.isArray(data) ? data[0] : data;
};

export const deleteProgram = async (id: string | number) => {
  await performWrite('DELETE', `programs?id=eq.${id}`);
  return true;
};
