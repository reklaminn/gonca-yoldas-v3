import { useState, useEffect } from 'react';

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

// Direct fetch to Supabase REST API (bypasses JS client issues)
async function fetchFromSupabase(tableName: string, query: string): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${tableName}?${query}`;
  
  console.log('🌐 [DirectFetch] URL:', url);
  
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
    console.error('❌ [DirectFetch] HTTP Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ [DirectFetch] Success, items:', data?.length || 0);
  return data;
}

export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 [usePageContent] Fetching content for page:', pageKey);

        const startTime = Date.now();

        // Use direct fetch instead of Supabase client
        const query = `page_key=eq.${encodeURIComponent(pageKey)}&is_active=eq.true&order=display_order.asc`;
        
        // Timeout with AbortController
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 15000);

        const data = await fetchFromSupabase('page_content', query);
        
        clearTimeout(timeoutId);

        const elapsed = Date.now() - startTime;
        console.log(`🔍 [usePageContent] Query completed in ${elapsed}ms`);

        if (!data || data.length === 0) {
          console.warn('⚠️ [usePageContent] NO DATA FOUND for page:', pageKey);
        } else {
          console.log('✅ [usePageContent] SUCCESS! Found', data.length, 'items for', pageKey);
          data.forEach((item: PageContent, i: number) => {
            console.log(`  ${i + 1}. ${item.section_key}: "${item.content_value?.substring(0, 50)}..."`);
          });
        }

        if (isMounted) {
          const contentMap: Record<string, string> = {};
          data?.forEach((item: PageContent) => {
            contentMap[item.section_key] = item.content_value || '';
          });
          setContent(contentMap);
          console.log('✅ [usePageContent] Content map set:', Object.keys(contentMap));
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.error('❌ [usePageContent] Request aborted (timeout)');
          if (isMounted) {
            setError('İstek zaman aşımına uğradı. Lütfen sayfayı yenileyin.');
          }
        } else {
          console.error('❌ [usePageContent] CRITICAL ERROR:', err);
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to fetch content');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🏁 [usePageContent] Loading complete for:', pageKey);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pageKey]);

  return { content, loading, error };
}

export function useAllPageContent(pageKey: string) {
  const [contentItems, setContentItems] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, [pageKey]);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useAllPageContent] Fetching all content for page:', pageKey);

      const query = `page_key=eq.${encodeURIComponent(pageKey)}&order=display_order.asc`;
      const data = await fetchFromSupabase('page_content', query);

      console.log('✅ [useAllPageContent] Fetched content items:', data?.length || 0);

      setContentItems(data || []);
    } catch (err) {
      console.error('❌ [useAllPageContent] Critical error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

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

// Keep using Supabase client for mutations (they work fine)
import { supabase } from '@/lib/supabaseClient';

export async function updatePageContent(
  id: string,
  updates: Partial<PageContent>
) {
  try {
    console.log('🔄 [updatePageContent] Updating content:', id, updates);

    const { data, error } = await supabase
      .from('page_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [updatePageContent] Update failed:', error);
      throw error;
    }

    console.log('✅ [updatePageContent] Update successful:', data);
    return data;
  } catch (err) {
    console.error('❌ [updatePageContent] Critical error:', err);
    throw err;
  }
}

export async function createPageContent(content: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>) {
  console.log('➕ [createPageContent] Creating new content:', content);

  const { data, error } = await supabase
    .from('page_content')
    .insert([content])
    .select()
    .single();

  if (error) {
    console.error('❌ [createPageContent] Creation failed:', error);
    throw error;
  }

  console.log('✅ [createPageContent] Creation successful:', data);
  return data;
}

export async function deletePageContent(id: string) {
  console.log('🗑️ [deletePageContent] Deleting content:', id);

  const { error } = await supabase
    .from('page_content')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ [deletePageContent] Deletion failed:', error);
    throw error;
  }

  console.log('✅ [deletePageContent] Deletion successful');
}
