import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Testimonial {
  id: string;
  parent_name: string;
  student_info: string;
  testimonial_text: string;
  rating: number;
  image_url: string | null;
  program_slug: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Direct fetch to Supabase REST API (bypasses JS client issues)
async function fetchFromSupabase(tableName: string, query: string): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${tableName}?${query}`;
  
  console.log(`🌐 [useTestimonials] Fetching from: ${tableName}`);
  
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
    console.error('❌ [useTestimonials] HTTP Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`✅ [useTestimonials] Success, ${tableName} items:`, data?.length || 0);
  return data;
}

export function useTestimonials(activeOnly: boolean = false) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [activeOnly]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useTestimonials] Fetching testimonials, activeOnly:', activeOnly);

      let query = 'order=display_order.asc,created_at.desc';

      if (activeOnly) {
        query += '&is_active=eq.true';
      }

      const data = await fetchFromSupabase('parent_testimonials', query);

      console.log('✅ [useTestimonials] Testimonials fetched:', data?.length || 0);
      setTestimonials(data || []);
    } catch (err) {
      console.error('❌ [useTestimonials] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  // Keep using Supabase client for mutations (admin operations)
  const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    const maxOrder = Math.max(...testimonials.map(t => t.display_order), 0);

    const { data, error } = await supabase
      .from('parent_testimonials')
      .insert([{ ...testimonial, display_order: maxOrder + 1 }])
      .select()
      .single();

    if (error) throw error;
    await fetchTestimonials(); // Refresh list
    return data;
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    const { data, error } = await supabase
      .from('parent_testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchTestimonials(); // Refresh list
    return data;
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from('parent_testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchTestimonials(); // Refresh list
  };

  const reorderTestimonials = async (newOrder: Testimonial[]) => {
    const updates = newOrder.map((testimonial, index) => 
      supabase
        .from('parent_testimonials')
        .update({ display_order: index + 1 })
        .eq('id', testimonial.id)
    );

    await Promise.all(updates);
    await fetchTestimonials();
  };

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    reorderTestimonials,
  };
}
