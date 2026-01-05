import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

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

// Helper for direct Supabase REST API calls
async function supabaseFetch(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: any,
  headers: Record<string, string> = {}
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // ✅ CRITICAL FIX: Get the logged-in user's access token
  const session = useAuthStore.getState().session;
  const accessToken = session?.access_token;

  // Ensure URL doesn't have double slashes if endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const url = `${supabaseUrl}/rest/v1/${cleanEndpoint}`;

  // Use the User Token if available, otherwise fallback to Anon Key
  const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;

  const defaultHeaders = {
    'apikey': supabaseKey,
    'Authorization': authHeader, // ✅ Sending User Token here
    'Content-Type': 'application/json',
    'Prefer': 'return=representation', // Important for getting back the modified data
    ...headers
  };

  const options: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`🌐 [SupabaseFetch] ${method} ${url}`);
  console.log(`🔑 [SupabaseFetch] Auth Mode: ${accessToken ? 'Authenticated User' : 'Anonymous (Read-Only)'}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [SupabaseFetch] HTTP Error ${response.status}:`, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  // DELETE might not return content if return=representation isn't supported or needed,
  // but we use Prefer: return=representation so it usually does.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Direct fetch to Supabase REST API (bypasses JS client issues)
// Keeping this for backward compatibility with existing hooks, but using the new helper internally could be an option.
// For now, let's keep it independent to avoid breaking the read logic which is working.
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
        }

        if (isMounted) {
          const contentMap: Record<string, string> = {};
          data?.forEach((item: PageContent) => {
            contentMap[item.section_key] = item.content_value || '';
          });
          setContent(contentMap);
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

// --- MUTATIONS (Now using Direct Fetch with Auth Token) ---

export async function updatePageContent(
  id: string,
  updates: Partial<PageContent>
) {
  try {
    console.log('🔄 [updatePageContent] Updating content:', id, updates);

    // Using PATCH /page_content?id=eq.{id}
    const data = await supabaseFetch(
      `page_content?id=eq.${id}`,
      'PATCH',
      updates
    );

    console.log('✅ [updatePageContent] Update successful:', data);
    return data?.[0]; // Supabase REST returns an array
  } catch (err) {
    console.error('❌ [updatePageContent] Critical error:', err);
    throw err;
  }
}

export async function createPageContent(content: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>) {
  try {
    console.log('➕ [createPageContent] Creating new content:', content);

    const data = await supabaseFetch(
      'page_content',
      'POST',
      content
    );

    console.log('✅ [createPageContent] Creation successful:', data);
    return data?.[0];
  } catch (err) {
    console.error('❌ [createPageContent] Critical error:', err);
    throw err;
  }
}

export async function deletePageContent(id: string) {
  try {
    console.log('🗑️ [deletePageContent] Deleting content:', id);

    await supabaseFetch(
      `page_content?id=eq.${id}`,
      'DELETE'
    );

    console.log('✅ [deletePageContent] Deletion successful');
  } catch (err) {
    console.error('❌ [deletePageContent] Critical error:', err);
    throw err;
  }
}
