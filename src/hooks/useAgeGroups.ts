import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface AgeGroup {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

export function useAgeGroups() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  // Token'ı güvenli bir şekilde al (LocalStorage'dan)
  const getAccessToken = () => {
    try {
      // 1. Önce LocalStorage'a bak (En hızlı ve güvenli yöntem)
      const storageKey = 'sb-jlwsapdvizzriomadhxj-auth-token';
      const sessionStr = localStorage.getItem(storageKey);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.access_token) {
          console.log('🔑 [AgeGroups] Token retrieved from LocalStorage');
          return session.access_token;
        }
      }
    } catch (e) {
      console.warn('⚠️ [AgeGroups] LocalStorage read failed:', e);
    }
    return null;
  };

  const fetchAgeGroups = async () => {
    setLoading(true);
    try {
      console.log('📡 [AgeGroups] Fetching started...');
      
      // 1. Yöntem: Supabase Client (Timeout korumalı)
      const clientPromise = supabase
        .from('age_groups')
        .select('*')
        .order('sort_order', { ascending: true });
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Client timeout')), 3000)
      );

      try {
        const { data, error } = await Promise.race([clientPromise, timeoutPromise]) as any;
        if (error) throw error;
        console.log('✅ [AgeGroups] Fetched via Client:', data?.length);
        setAgeGroups(data || []);
        setLoading(false);
        return;
      } catch (e) {
        console.warn('⚠️ [AgeGroups] Client fetch failed/timed out, switching to REST...');
      }

      // 2. Yöntem: REST API (Yedek)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/age_groups?select=*&order=sort_order.asc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (!response.ok) throw new Error('REST fetch failed');
      
      const data = await response.json();
      console.log('✅ [AgeGroups] Fetched via REST:', data?.length);
      setAgeGroups(data || []);

    } catch (err) {
      console.error('❌ [AgeGroups] All fetch methods failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const performWrite = async (method: 'POST' | 'PATCH' | 'DELETE', body?: any, id?: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Token'ı al
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      console.error('❌ [AgeGroups] No access token found! User might be logged out.');
      throw new Error('Oturum süresi dolmuş veya giriş yapılmamış. Lütfen sayfayı yenileyip tekrar giriş yapın.');
    }

    let url = `${supabaseUrl}/rest/v1/age_groups`;
    if (id) url += `?id=eq.${id}`;

    const headers: HeadersInit = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`, // Anon Key yerine User Token kullan
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    try {
      console.log(`⚡ [AgeGroups] Performing ${method} with token...`);
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ [AgeGroups] API Error ${response.status}:`, text);
        throw new Error(`İşlem başarısız: ${response.statusText} (${text})`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.error(`❌ [AgeGroups] ${method} failed:`, err);
      throw err;
    }
  };

  const addAgeGroup = async (label: string, value: string, sortOrder: number) => {
    const data = await performWrite('POST', { label, value, sort_order: sortOrder });
    const newItem = Array.isArray(data) ? data[0] : data;
    if (newItem) {
      setAgeGroups(prev => [...prev, newItem]);
    }
    return newItem;
  };

  const updateAgeGroup = async (id: string, updates: Partial<AgeGroup>) => {
    const data = await performWrite('PATCH', updates, id);
    const updatedItem = Array.isArray(data) ? data[0] : data;
    if (updatedItem) {
      setAgeGroups(prev => prev.map(g => g.id === id ? updatedItem : g));
    }
    return updatedItem;
  };

  const deleteAgeGroup = async (id: string) => {
    await performWrite('DELETE', undefined, id);
    setAgeGroups(prev => prev.filter(g => g.id !== id));
  };

  return {
    ageGroups,
    loading,
    error,
    addAgeGroup,
    updateAgeGroup,
    deleteAgeGroup,
    refetch: fetchAgeGroups
  };
}
