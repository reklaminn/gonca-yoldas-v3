import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
  List,
  Settings,
  Type,
  AlignLeft,
  Calendar,
  CheckSquare,
  Clock
} from 'lucide-react';
import { useAgeGroups } from '@/hooks/useAgeGroups';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface PricingOption {
  id: string;
  title: string;
  price: number;
  description: string;
  details: string;
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string;
}

// Yeni eklenen Program Tarihi arayüzü
interface ProgramDate {
  id: string;
  title: string; // Örn: "15 Ekim Grubu"
  status: 'active' | 'passive';
  label: 'collecting' | 'active' | 'full' | 'soon';
}

interface ProgramFormData {
  title: string;
  short_title: string;
  title_en: string;
  age_group: string;
  age_range: string;
  description: string;
  price: number;
  iyzilink: string;
  duration: string;
  schedule: string;
  lessons_per_week: number;
  lesson_duration: string;
  max_students: number;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  sort_order: number;
  features: { text: string }[];
  outcomes: { text: string }[];
  faqs: { question: string; answer: string }[];
  pricing_options: PricingOption[];
  custom_fields: CustomField[];
  program_dates: ProgramDate[]; // Yeni alan
  metadata: any;
}

const DATE_LABELS = {
  collecting: 'Talep Toplanıyor',
  active: 'Aktif (Kayıt Açık)',
  full: 'Doldu',
  soon: 'Yakında'
};

const ProgramForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { session } = useAuthStore();
  const { ageGroups, loading: ageGroupsLoading } = useAgeGroups();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProgramFormData>({
    defaultValues: {
      title: '',
      short_title: '',
      title_en: '',
      age_group: '',
      age_range: '',
      description: '',
      price: 0,
      iyzilink: '',
      duration: '',
      schedule: '',
      lessons_per_week: 2,
      lesson_duration: '',
      max_students: 10,
      status: 'draft',
      featured: false,
      sort_order: 0,
      features: [{ text: '' }],
      outcomes: [{ text: '' }],
      faqs: [{ question: '', answer: '' }],
      pricing_options: [],
      custom_fields: [],
      program_dates: [], // Varsayılan boş liste
      metadata: {}
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: 'features',
  });

  const {
    fields: outcomeFields,
    append: appendOutcome,
    remove: removeOutcome,
  } = useFieldArray({
    control,
    name: 'outcomes',
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: 'faqs',
  });

  const {
    fields: pricingOptionFields,
    append: appendPricingOption,
    remove: removePricingOption,
  } = useFieldArray({
    control,
    name: 'pricing_options',
  });

  const {
    fields: customFieldFields,
    append: appendCustomField,
    remove: removeCustomField,
  } = useFieldArray({
    control,
    name: 'custom_fields',
  });

  // Yeni tarih alanı için field array
  const {
    fields: programDateFields,
    append: appendProgramDate,
    remove: removeProgramDate,
  } = useFieldArray({
    control,
    name: 'program_dates',
  });

  const ageGroup = watch('age_group');

  // Update age_range when age_group changes
  useEffect(() => {
    if (ageGroup && ageGroups.length > 0) {
      const selectedGroup = ageGroups.find(g => g.value === ageGroup);
      if (selectedGroup) {
        setValue('age_range', selectedGroup.label);
      }
    }
  }, [ageGroup, ageGroups, setValue]);

  // Load existing program data in edit mode
  const loadProgramData = useCallback(async (programId: string) => {
    if (!session?.access_token) {
      console.error('❌ [ProgramForm] No access token');
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }

    try {
      console.log('📝 [ProgramForm] Loading program:', programId);
      setInitialLoading(true);

      // Fetch program
      const programResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/programs?id=eq.${programId}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!programResponse.ok) {
        throw new Error('Program yüklenemedi');
      }

      const programData = await programResponse.json();
      const program = programData[0];

      if (!program) {
        throw new Error('Program bulunamadı');
      }

      // Fetch features
      const featuresResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/program_features?program_id=eq.${programId}&order=sort_order.asc&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const features = featuresResponse.ok ? await featuresResponse.json() : [];

      // Fetch FAQs
      const faqsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/program_faqs?program_id=eq.${programId}&order=sort_order.asc&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const faqs = faqsResponse.ok ? await faqsResponse.json() : [];

      // Prepare features and outcomes
      const programFeatures = features?.filter((f: any) => f.feature_type === 'feature') || [];
      const programOutcomes = features?.filter((f: any) => f.feature_type === 'outcome') || [];

      // Parse metadata
      const metadata = program.metadata || {};
      
      // Parse pricing options
      const pricingOptions = metadata.pricing_options?.map((opt: any) => ({
        id: opt.id,
        title: opt.title,
        price: opt.price,
        description: opt.description,
        details: Array.isArray(opt.details) ? opt.details.join('\n') : (opt.details || '')
      })) || [];

      // Parse custom fields
      const customFields = metadata.custom_fields?.map((field: any) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || '',
        options: Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')
      })) || [];

      // Parse program dates
      const programDates = metadata.program_dates?.map((date: any) => ({
        id: date.id,
        title: date.title,
        status: date.status || 'active',
        label: date.label || 'collecting'
      })) || [];

      // Reset form with all data
      reset({
        title: program.title,
        short_title: program.short_title || '',
        title_en: program.title_en || '',
        age_group: program.age_group,
        age_range: program.age_range,
        description: program.description,
        price: program.price,
        iyzilink: program.iyzilink || '',
        duration: program.duration,
        schedule: program.schedule,
        lessons_per_week: program.lessons_per_week || 1,
        lesson_duration: program.lesson_duration || '',
        max_students: program.max_students || 10,
        status: program.status || 'draft',
        featured: program.featured || false,
        sort_order: program.sort_order || 0,
        features: programFeatures.length > 0
          ? programFeatures.map((f: any) => ({ text: f.feature_text }))
          : [{ text: '' }],
        outcomes: programOutcomes.length > 0
          ? programOutcomes.map((f: any) => ({ text: f.feature_text }))
          : [{ text: '' }],
        faqs: faqs && faqs.length > 0
          ? faqs.map((f: any) => ({ question: f.question, answer: f.answer }))
          : [{ question: '', answer: '' }],
        pricing_options: pricingOptions,
        custom_fields: customFields,
        program_dates: programDates,
        metadata: metadata
      });

      // Set existing image
      if (program.image_url) {
        setExistingImageUrl(program.image_url);
        setImagePreview(program.image_url);
      }

      console.log('✅ [ProgramForm] Form data loaded successfully');
    } catch (err) {
      console.error('❌ [ProgramForm] Error loading program:', err);
      showNotification('error', 'Program yüklenirken bir hata oluştu');
    } finally {
      setInitialLoading(false);
    }
  }, [reset, session?.access_token]);

  // Load data only once on mount
  useEffect(() => {
    if (isEditMode && id && session?.access_token) {
      loadProgramData(id);
    } else if (isEditMode && !session?.access_token) {
      setInitialLoading(false);
    } else {
      setInitialLoading(false);
    }
  }, [id, isEditMode, session?.access_token, loadProgramData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Resim boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Lütfen geçerli bir resim dosyası seçin');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl('');
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const uploadImage = async (file: File, programId: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${programId}-${Date.now()}.${fileExt}`;
      
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/object/program-images/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Resim yüklenemedi');
      }

      return `${SUPABASE_URL}/storage/v1/object/public/program-images/${fileName}`;
    } catch (err) {
      console.error('❌ [ProgramForm] Upload error:', err);
      throw err;
    }
  };

  const onSubmit = async (data: ProgramFormData) => {
    if (!session?.access_token) {
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);
      const slug = generateSlug(data.title);

      // Check if slug exists
      const slugCheckResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/programs?slug=eq.${slug}&select=id${isEditMode && id ? `&id=neq.${id}` : ''}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const existingPrograms = await slugCheckResponse.json();
      if (existingPrograms && existingPrograms.length > 0) {
        showNotification('error', 'Bu başlıkla bir program zaten mevcut');
        setLoading(false);
        return;
      }

      let imageUrl = existingImageUrl;

      if (imageFile) {
        try {
          setUploadProgress(50);
          const tempId = id || 'temp-' + Date.now();
          imageUrl = await uploadImage(imageFile, tempId);
          setUploadProgress(100);
        } catch (err) {
          showNotification('error', 'Resim yüklenirken bir hata oluştu');
          setLoading(false);
          return;
        }
      }

      // Prepare metadata
      const updatedMetadata = {
        ...data.metadata,
        pricing_options: data.pricing_options.map(opt => ({
          id: opt.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: opt.title,
          price: Number(opt.price),
          description: opt.description,
          details: opt.details.split('\n').filter(line => line.trim() !== '')
        })),
        custom_fields: data.custom_fields.map(field => ({
          id: field.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          options: field.type === 'select' && field.options 
            ? field.options.split(',').map(o => o.trim()).filter(o => o !== '') 
            : []
        })),
        program_dates: data.program_dates.map(date => ({
          id: date.id || `date_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: date.title,
          status: date.status,
          label: date.label
        }))
      };

      // Prepare program data
      const programData = {
        slug,
        title: data.title,
        short_title: data.short_title,
        title_en: data.title_en || null,
        age_group: data.age_group,
        age_range: data.age_range,
        description: data.description,
        image_url: imageUrl || null,
        price: Number(data.price),
        iyzilink: data.iyzilink || null,
        duration: data.duration,
        schedule: data.schedule,
        lessons_per_week: Number(data.lessons_per_week),
        lesson_duration: data.lesson_duration,
        max_students: Number(data.max_students),
        status: data.status,
        featured: data.featured,
        sort_order: Number(data.sort_order),
        metadata: updatedMetadata
      };

      let programId: string;

      if (isEditMode && id) {
        // Update existing program
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/programs?id=eq.${id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(programData),
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Program güncellenemedi');
        }

        programId = id;

        // Delete existing features and FAQs
        await fetch(
          `${SUPABASE_URL}/rest/v1/program_features?program_id=eq.${id}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        await fetch(
          `${SUPABASE_URL}/rest/v1/program_faqs?program_id=eq.${id}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );
      } else {
        // Create new program
        const createResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/programs`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(programData),
          }
        );

        if (!createResponse.ok) {
          throw new Error('Program oluşturulamadı');
        }

        const newProgram = await createResponse.json();
        programId = newProgram[0].id;
      }

      // Add features
      const features = data.features.filter((f) => f.text.trim());
      if (features.length > 0) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/program_features`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              features.map((f, i) => ({
                program_id: programId,
                feature_text: f.text,
                feature_type: 'feature',
                sort_order: i,
              }))
            ),
          }
        );
      }

      // Add outcomes
      const outcomes = data.outcomes.filter((o) => o.text.trim());
      if (outcomes.length > 0) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/program_features`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              outcomes.map((o, i) => ({
                program_id: programId,
                feature_text: o.text,
                feature_type: 'outcome',
                sort_order: i,
              }))
            ),
          }
        );
      }

      // Add FAQs
      const faqs = data.faqs.filter((f) => f.question.trim() && f.answer.trim());
      if (faqs.length > 0) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/program_faqs`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              faqs.map((f, i) => ({
                program_id: programId,
                question: f.question,
                answer: f.answer,
                sort_order: i,
              }))
            ),
          }
        );
      }

      showNotification(
        'success',
        isEditMode ? 'Program başarıyla güncellendi' : 'Program başarıyla oluşturuldu'
      );

      setTimeout(() => {
        navigate('/admin/programs');
      }, 1500);
    } catch (err) {
      console.error('❌ [ProgramForm] Save error:', err);
      showNotification('error', 'Program kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?')) {
      navigate('/admin/programs');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Program yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/programs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Program Düzenle' : 'Yeni Program'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode
                ? 'Mevcut programı düzenleyin'
                : 'Yeni bir eğitim programı oluşturun'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Program hakkında temel bilgileri girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Program Başlığı (TR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Bu alan zorunludur' })}
                  placeholder="Örn: Bebeğimle Evde İngilizce"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_title">
                  Kısa Başlık <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="short_title"
                  {...register('short_title', { required: 'Bu alan zorunludur' })}
                  placeholder="Örn: Baby English"
                />
                {errors.short_title && (
                  <p className="text-sm text-red-500">{errors.short_title.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en">Program Başlığı (EN)</Label>
              <Input
                id="title_en"
                {...register('title_en')}
                placeholder="Örn: Baby English at Home"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age_group">
                  Yaş Grubu <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('age_group')}
                  onValueChange={(value) => setValue('age_group', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yaş grubu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroupsLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">Yükleniyor...</div>
                    ) : (
                      ageGroups.map((group) => (
                        <SelectItem key={group.id} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_range">Yaş Aralığı (Otomatik)</Label>
                <Input id="age_range" {...register('age_range')} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Açıklama <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Bu alan zorunludur' })}
                placeholder="Program hakkında detaylı açıklama..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Program Görseli</CardTitle>
            <CardDescription>
              Program için bir görsel yükleyin (Max 5MB, JPG/PNG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Kaldır
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Görsel yüklemek için tıklayın veya sürükleyin
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle>Program Detayları</CardTitle>
            <CardDescription>Ders programı ve fiyatlandırma bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Varsayılan Fiyat (₺) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', {
                    required: 'Bu alan zorunludur',
                    min: { value: 0, message: 'Fiyat 0\'dan küçük olamaz' },
                  })}
                  placeholder="2500"
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iyzilink" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-blue-600" />
                  İyzico Ödeme Linki
                </Label>
                <Input
                  id="iyzilink"
                  {...register('iyzilink')}
                  placeholder="https://iyzi.link/..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bu link şimdilik sadece veritabanında saklanacaktır. Web sitesinde görünmez.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Süre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  {...register('duration', { required: 'Bu alan zorunludur' })}
                  placeholder="Örn: 12 hafta"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">
                  Program <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="schedule"
                  {...register('schedule', { required: 'Bu alan zorunludur' })}
                  placeholder="Örn: Haftada 2 ders, 30 dakika"
                />
                {errors.schedule && (
                  <p className="text-sm text-red-500">{errors.schedule.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessons_per_week">
                  Haftalık Ders Sayısı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lessons_per_week"
                  type="number"
                  {...register('lessons_per_week', {
                    required: 'Bu alan zorunludur',
                    min: { value: 1, message: 'En az 1 olmalıdır' },
                  })}
                  placeholder="2"
                />
                {errors.lessons_per_week && (
                  <p className="text-sm text-red-500">
                    {errors.lessons_per_week.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson_duration">
                  Ders Süresi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lesson_duration"
                  {...register('lesson_duration', { required: 'Bu alan zorunludur' })}
                  placeholder="30 dakika"
                />
                {errors.lesson_duration && (
                  <p className="text-sm text-red-500">
                    {errors.lesson_duration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_students">
                  Maksimum Öğrenci <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="max_students"
                  type="number"
                  {...register('max_students', {
                    required: 'Bu alan zorunludur',
                    min: { value: 1, message: 'En az 1 olmalıdır' },
                  })}
                  placeholder="10"
                />
                {errors.max_students && (
                  <p className="text-sm text-red-500">{errors.max_students.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Options */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle>Fiyatlandırma Seçenekleri (Paketler)</CardTitle>
            </div>
            <CardDescription>
              Eğer programın birden fazla paketi varsa (örn: 12 Derslik / 24 Derslik), buradan ekleyebilirsiniz.
              Hiç paket eklemezseniz yukarıdaki "Varsayılan Fiyat" geçerli olur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pricingOptionFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePricingOption(index)}
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <div className="space-y-2">
                    <Label>Paket Başlığı</Label>
                    <Input
                      {...register(`pricing_options.${index}.title` as const, { required: true })}
                      placeholder="Örn: 12 Derslik Paket"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fiyat (₺)</Label>
                    <Input
                      type="number"
                      {...register(`pricing_options.${index}.price` as const, { required: true })}
                      placeholder="12000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kısa Açıklama</Label>
                  <Input
                    {...register(`pricing_options.${index}.description` as const)}
                    placeholder="Örn: Haftada 1 gün, toplam 12 hafta"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Detaylar (Her satıra bir özellik)
                  </Label>
                  <Textarea
                    {...register(`pricing_options.${index}.details` as const)}
                    placeholder="Süre: 50 dk&#10;Gün: Pazar&#10;Saat: 21:45"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendPricingOption({ id: '', title: '', price: 0, description: '', details: '' })}
              className="w-full border-dashed border-2 py-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Paket Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Program Dates (New Section) */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <CardTitle>Eğitim Tarihleri (Dönemler)</CardTitle>
            </div>
            <CardDescription>
              Bu eğitimin açılacağı tarihleri ve durumlarını buradan yönetebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {programDateFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProgramDate(index)}
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <div className="space-y-2">
                    <Label>Tarih / Dönem Açıklaması</Label>
                    <Input
                      {...register(`program_dates.${index}.title` as const, { required: true })}
                      placeholder="Örn: 15 Ekim - 15 Ocak Grubu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durum Etiketi</Label>
                    <Select
                      value={watch(`program_dates.${index}.label`)}
                      onValueChange={(value: any) => setValue(`program_dates.${index}.label`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Etiket seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collecting">Talep Toplanıyor</SelectItem>
                        <SelectItem value="active">Aktif (Kayıt Açık)</SelectItem>
                        <SelectItem value="full">Doldu</SelectItem>
                        <SelectItem value="soon">Yakında</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`date-status-${index}`}
                      checked={watch(`program_dates.${index}.status`) === 'active'}
                      onCheckedChange={(checked) => setValue(`program_dates.${index}.status`, checked ? 'active' : 'passive')}
                    />
                    <Label htmlFor={`date-status-${index}`} className="cursor-pointer">
                      {watch(`program_dates.${index}.status`) === 'active' ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Yayında
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pasif
                        </span>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendProgramDate({ id: '', title: '', status: 'active', label: 'collecting' })}
              className="w-full border-dashed border-2 py-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Tarih Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Custom Registration Fields */}
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <CardTitle>Özel Kayıt Alanları</CardTitle>
            </div>
            <CardDescription>
              Bu program için kayıt sırasında kullanıcılardan istenecek ek bilgileri buradan tanımlayabilirsiniz.
              (Örn: Çocuğun Adı, Doğum Tarihi, Alerji Durumu vb.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {customFieldFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomField(index)}
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <div className="space-y-2">
                    <Label>Alan Başlığı (Soru)</Label>
                    <Input
                      {...register(`custom_fields.${index}.label` as const, { required: true })}
                      placeholder="Örn: Çocuğun Adı Soyadı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Veri Tipi</Label>
                    <Select
                      value={watch(`custom_fields.${index}.type`)}
                      onValueChange={(value: any) => setValue(`custom_fields.${index}.type`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tip seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2"><Type className="h-4 w-4" /> Kısa Metin</div>
                        </SelectItem>
                        <SelectItem value="textarea">
                          <div className="flex items-center gap-2"><AlignLeft className="h-4 w-4" /> Uzun Metin</div>
                        </SelectItem>
                        <SelectItem value="number">
                          <div className="flex items-center gap-2"><span className="font-mono font-bold text-xs border rounded px-1">123</span> Sayı</div>
                        </SelectItem>
                        <SelectItem value="date">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Tarih</div>
                        </SelectItem>
                        <SelectItem value="select">
                          <div className="flex items-center gap-2"><List className="h-4 w-4" /> Seçim Kutusu</div>
                        </SelectItem>
                        <SelectItem value="checkbox">
                          <div className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Onay Kutusu</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İpucu Metni (Placeholder)</Label>
                    <Input
                      {...register(`custom_fields.${index}.placeholder` as const)}
                      placeholder="Örn: Lütfen tam ad giriniz"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 pt-8">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`required-${index}`}
                        checked={watch(`custom_fields.${index}.required`)}
                        onCheckedChange={(checked) => setValue(`custom_fields.${index}.required`, checked)}
                      />
                      <Label htmlFor={`required-${index}`} className="cursor-pointer">Zorunlu Alan</Label>
                    </div>
                  </div>
                </div>

                {watch(`custom_fields.${index}.type`) === 'select' && (
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Seçenekler</Label>
                    <Input
                      {...register(`custom_fields.${index}.options` as const)}
                      placeholder="Seçenekleri virgül ile ayırın (Örn: Başlangıç, Orta, İleri)"
                    />
                    <p className="text-xs text-gray-500">Kullanıcının seçebileceği değerleri virgül ile ayırarak yazın.</p>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendCustomField({ id: '', label: '', type: 'text', required: false, placeholder: '', options: '' })}
              className="w-full border-dashed border-2 py-6 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kayıt Alanı Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Program Özellikleri</CardTitle>
            <CardDescription>Programın öne çıkan özelliklerini ekleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featureFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    {...register(`features.${index}.text`)}
                    placeholder="Örn: Anne-baba katılımlı online dersler"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeFeature(index)}
                  disabled={featureFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendFeature({ text: '' })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Özellik Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Öğrenme Çıktıları</CardTitle>
            <CardDescription>
              Öğrencilerin kazanacağı becerileri listeleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outcomeFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    {...register(`outcomes.${index}.text`)}
                    placeholder="Örn: Temel İngilizce seslere aşinalık kazanır"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeOutcome(index)}
                  disabled={outcomeFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendOutcome({ text: '' })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Çıktı Ekle
            </Button>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Sıkça Sorulan Sorular</CardTitle>
            <CardDescription>Program hakkında SSS ekleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqFields.map((field, index) => (
              <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Soru {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaq(index)}
                    disabled={faqFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  {...register(`faqs.${index}.question`)}
                  placeholder="Soru..."
                />
                <Textarea
                  {...register(`faqs.${index}.answer`)}
                  placeholder="Cevap..."
                  rows={3}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendFaq({ question: '', answer: '' })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              SSS Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Yayın Ayarları</CardTitle>
            <CardDescription>Program durumu ve görünürlük ayarları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) =>
                    setValue('status', value as 'active' | 'draft' | 'archived')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="archived">Arşiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sıralama</Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...register('sort_order')}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="featured" className="text-base">
                  Öne Çıkan Program
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bu program anasayfada öne çıkarılsın mı?
                </p>
              </div>
              <Switch
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Güncelle' : 'Oluştur'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProgramForm;
