import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface AgeGroup {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

// Direct fetch to Supabase REST API (bypasses JS client issues)
async function fetchFromSupabase(tableName: string, query: string): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${tableName}?${query}`;
  
  console.log(`🌐 [useAgeGroups] Fetching from: ${tableName}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [useAgeGroups] HTTP Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`✅ [useAgeGroups] Success, ${tableName} items:`, data?.length || 0);
  return data;
}

export function useAgeGroups() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const fetchAgeGroups = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 [useAgeGroups] Fetching age groups');

      const query = 'order=sort_order.asc';
      const data = await fetchFromSupabase('age_groups', query);

      console.log('✅ [useAgeGroups] Age groups fetched:', data?.length || 0);
      setAgeGroups(data || []);
    } catch (err) {
      console.error('❌ [useAgeGroups] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch age groups');
    } finally {
      setLoading(false);
    }
  };

  // Keep using Supabase client for mutations (admin operations)
  const addAgeGroup = async (label: string, value: string, sortOrder: number) => {
    try {
      const { data, error } = await supabase
        .from('age_groups')
        .insert([{ label, value, sort_order: sortOrder }])
        .select()
        .single();

      if (error) throw error;
      setAgeGroups([...ageGroups, data]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateAgeGroup = async (id: string, updates: Partial<AgeGroup>) => {
    try {
      const { data, error } = await supabase
        .from('age_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAgeGroups(ageGroups.map(g => g.id === id ? data : g));
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteAgeGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('age_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAgeGroups(ageGroups.filter(g => g.id !== id));
    } catch (err) {
      throw err;
    }
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
