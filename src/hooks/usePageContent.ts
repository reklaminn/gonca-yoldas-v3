import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content_type: string;
  content_value: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();

    // Real-time subscription for content changes
    const channel = supabase
      .channel(`page_content_${pageKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content',
          filter: `page_key=eq.${pageKey}`,
        },
        (payload) => {
          console.log('🔔 Real-time update received:', payload);
          // Only refetch if it's not an UPDATE event (to avoid race condition)
          if (payload.eventType !== 'UPDATE') {
            fetchContent();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageKey]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      console.log('📥 Fetched content:', data);

      const contentMap: Record<string, string> = {};
      data?.forEach((item) => {
        contentMap[item.section_key] = item.content_value || '';
      });

      setContent(contentMap);
    } catch (err) {
      console.error('Error fetching page content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, error, refetch: fetchContent };
}

export function useAllPageContent(pageKey: string) {
  const [contentItems, setContentItems] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();

    // DISABLED: Real-time subscription causing update conflicts
    // Will use manual state updates instead
    
  }, [pageKey]);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      console.log('📥 Admin fetched all content:', data);
      setContentItems(data || []);
    } catch (err) {
      console.error('Error fetching all page content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  // Manual state update function
  const updateLocalItem = (id: string, updates: Partial<PageContent>) => {
    setContentItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      )
    );
  };

  return { 
    contentItems, 
    loading, 
    error, 
    refetch: fetchAllContent,
    updateLocalItem 
  };
}

export async function updatePageContent(
  id: string,
  updates: Partial<PageContent>
) {
  console.log('🔄 updatePageContent called:', { id, updates });

  try {
    const { data, error } = await supabase
      .from('page_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Update successful:', data);
    return data;
  } catch (err) {
    console.error('❌ updatePageContent failed:', err);
    throw err;
  }
}

export async function createPageContent(content: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('page_content')
    .insert([content])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePageContent(id: string) {
  const { error } = await supabase
    .from('page_content')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
