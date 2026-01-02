import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Program {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  title_en?: string | null;
  age_group: '0-2' | '2-5' | '5-10';
  age_range: string;
  description: string;
  image_url?: string | null;
  price: number;
  iyzilink?: string | null;
  duration: string;
  schedule: string;
  lessons_per_week: number;
  lesson_duration: string;
  max_students: number;
  enrolled_students: number;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any> | null;
}

export interface ProgramFeature {
  id: string;
  program_id: string;
  feature_text: string;
  feature_type: 'feature' | 'outcome';
  sort_order: number;
}

export interface ProgramFAQ {
  id: string;
  program_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface ProgramDetails extends Program {
  features: ProgramFeature[];
  outcomes: ProgramFeature[];
  faqs: ProgramFAQ[];
}

// Direct fetch to Supabase REST API (bypasses JS client issues)
async function fetchFromSupabase(tableName: string, query: string): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${tableName}?${query}`;
  
  console.log(`🌐 [usePrograms] Fetching from: ${tableName}`);
  
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
    console.error('❌ [usePrograms] HTTP Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`✅ [usePrograms] Success, ${tableName} items:`, data?.length || 0);
  return data;
}

export function usePrograms(status?: 'active' | 'draft' | 'archived') {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [status]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [usePrograms] Fetching programs, status:', status || 'all');

      let query = 'order=sort_order.asc';
      
      if (status) {
        query += `&status=eq.${status}`;
      }

      const data = await fetchFromSupabase('programs', query);

      console.log('✅ [usePrograms] Programs fetched:', data?.length || 0);
      setPrograms(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ [usePrograms] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch programs';
      setError(errorMessage);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  return { programs, loading, error, refetch: fetchPrograms };
}

export function useProgramDetails(slug: string) {
  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProgramDetails();
    }
  }, [slug]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useProgramDetails] Fetching program:', slug);

      // Fetch program
      const query = `slug=eq.${encodeURIComponent(slug)}&status=eq.active`;
      const programData = await fetchFromSupabase('programs', query);

      if (!programData || programData.length === 0) {
        throw new Error('Program not found');
      }

      const programItem = programData[0];

      // Fetch features
      const featuresQuery = `program_id=eq.${programItem.id}&order=sort_order.asc`;
      const featuresData = await fetchFromSupabase('program_features', featuresQuery);

      // Fetch FAQs
      const faqsQuery = `program_id=eq.${programItem.id}&order=sort_order.asc`;
      const faqsData = await fetchFromSupabase('program_faqs', faqsQuery);

      const features = featuresData?.filter((f: ProgramFeature) => f.feature_type === 'feature') || [];
      const outcomes = featuresData?.filter((f: ProgramFeature) => f.feature_type === 'outcome') || [];

      setProgram({
        ...programItem,
        features,
        outcomes,
        faqs: faqsData || [],
      });
      setError(null);
    } catch (err) {
      console.error('❌ [useProgramDetails] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch program details';
      setError(errorMessage);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  return { program, loading, error, refetch: fetchProgramDetails };
}

// Keep using Supabase client for mutations (they work fine for admin operations)
export async function createProgram(programData: Partial<Program>): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .insert([programData])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Program creation failed: no data returned.');
  return data;
}

export async function updateProgram(id: string, programData: Partial<Program>): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .update(programData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Program update failed: no data returned.');
  return data;
}

export async function deleteProgram(id: string) {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadProgramImage(file: File, programId: string) {
  try {
    console.log('🔄 Starting image upload...');
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('Program ID:', programId);

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Lütfen geçerli bir resim dosyası seçin');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Resim boyutu 5MB\'dan küçük olmalıdır');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${programId}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Store in root of bucket

    console.log('📁 Upload path:', filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('program-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      
      if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
        throw new Error('Storage bucket yapılandırması eksik. Lütfen yönetici ile iletişime geçin.');
      }
      
      if (uploadError.message.includes('policy')) {
        throw new Error('Yükleme izni yok. Lütfen yönetici ile iletişime geçin.');
      }
      
      throw new Error(uploadError.message || 'Resim yüklenirken bir hata oluştu');
    }

    console.log('✅ Upload successful:', uploadData);

    // Get public URL safely
    const { data: urlData } = supabase.storage
      .from('program-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Public URL is empty or not available.');
    }

    console.log('🔗 Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (err) {
    console.error('❌ Upload failed:', err);
    throw err;
  }
}

export async function addProgramFeature(
  programId: string,
  featureText: string,
  featureType: 'feature' | 'outcome',
  sortOrder: number = 0
) {
  const { data, error } = await supabase
    .from('program_features')
    .insert([{
      program_id: programId,
      feature_text: featureText,
      feature_type: featureType,
      sort_order: sortOrder,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addProgramFAQ(
  programId: string,
  question: string,
  answer: string,
  sortOrder: number = 0
) {
  const { data, error } = await supabase
    .from('program_faqs')
    .insert([{
      program_id: programId,
      question,
      answer,
      sort_order: sortOrder,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
