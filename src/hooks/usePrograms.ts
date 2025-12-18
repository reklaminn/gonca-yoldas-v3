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

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      let query = supabase
        .from('programs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch programs');
      }

      console.log('Programs fetched successfully:', data);
      setPrograms(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
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

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (programError) {
        console.error('Program fetch error:', programError);
        throw new Error(programError.message);
      }

      if (!programData) {
        throw new Error('Program not found');
      }

      const { data: featuresData, error: featuresError } = await supabase
        .from('program_features')
        .select('*')
        .eq('program_id', programData.id)
        .order('sort_order', { ascending: true });

      if (featuresError) {
        console.error('Features fetch error:', featuresError);
        throw new Error(featuresError.message);
      }

      const { data: faqsData, error: faqsError } = await supabase
        .from('program_faqs')
        .select('*')
        .eq('program_id', programData.id)
        .order('sort_order', { ascending: true });

      if (faqsError) {
        console.error('FAQs fetch error:', faqsError);
        throw new Error(faqsError.message);
      }

      const features = featuresData?.filter(f => f.feature_type === 'feature') || [];
      const outcomes = featuresData?.filter(f => f.feature_type === 'outcome') || [];

      setProgram({
        ...programData,
        features,
        outcomes,
        faqs: faqsData || [],
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching program details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch program details';
      setError(errorMessage);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  return { program, loading, error, refetch: fetchProgramDetails };
}

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
