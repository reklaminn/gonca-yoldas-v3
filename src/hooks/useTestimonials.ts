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

export function useTestimonials(activeOnly: boolean = false) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();

    // Real-time subscription
    const channel = supabase
      .channel('parent_testimonials_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parent_testimonials',
        },
        () => {
          fetchTestimonials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOnly]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('parent_testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTestimonials(data || []);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    const maxOrder = Math.max(...testimonials.map(t => t.display_order), 0);

    const { data, error } = await supabase
      .from('parent_testimonials')
      .insert([{ ...testimonial, display_order: maxOrder + 1 }])
      .select()
      .single();

    if (error) throw error;
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
    return data;
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from('parent_testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
