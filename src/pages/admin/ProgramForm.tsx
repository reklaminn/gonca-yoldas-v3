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
  Clock,
  Gift,
  TrendingUp,
  Database
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
  iyzilink?: string;
  sendpulse_course_id?: string;
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string;
}

interface ProgramDate {
  id: string;
  title: string;
  status: 'active' | 'passive';
  label: 'collecting' | 'active' | 'full' | 'soon';
}

interface UpsellOption {
  id: string;
  target_program_id: string;
  title: string;
  description: string;
  discounted_price: number;
  iyzilink?: string;
  sendpulse_course_id?: string;
}

interface SimpleProgram {
  id: string;
  title: string;
  price: number;
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
  sendpulse_id: string;
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
  program_dates: ProgramDate[];
  upsells: UpsellOption[];
  metadata: any;
}

const ProgramForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { session } = useAuthStore();
  const { ageGroups, loading: ageGroupsLoading } = useAgeGroups();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [availablePrograms, setAvailablePrograms] = useState<SimpleProgram[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
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
      sendpulse_id: '',
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
      program_dates: [],
      upsells: [],
      metadata: {}
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: 'features' });
  const { fields: outcomeFields, append: appendOutcome, remove: removeOutcome } = useFieldArray({ control, name: 'outcomes' });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control, name: 'faqs' });
  const { fields: pricingOptionFields, append: appendPricingOption, remove: removePricingOption } = useFieldArray({ control, name: 'pricing_options' });
  const { fields: customFieldFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({ control, name: 'custom_fields' });
  const { fields: programDateFields, append: appendProgramDate, remove: removeProgramDate } = useFieldArray({ control, name: 'program_dates' });
  const { fields: upsellFields, append: appendUpsell, remove: removeUpsell } = useFieldArray({ control, name: 'upsells' });

  const ageGroup = watch('age_group');

  useEffect(() => {
    if (ageGroup && ageGroups.length > 0) {
      const selectedGroup = ageGroups.find(g => g.value === ageGroup);
      if (selectedGroup) {
        setValue('age_range', selectedGroup.label);
      }
    }
  }, [ageGroup, ageGroups, setValue]);

  const fetchAvailablePrograms = useCallback(async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/programs?select=id,title,price&status=eq.active`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const filtered = isEditMode ? data.filter((p: any) => p.id !== id) : data;
        setAvailablePrograms(filtered);
      }
    } catch (error) {
      console.error('Programlar yüklenirken hata:', error);
    }
  }, [id, isEditMode, session?.access_token]);

  const loadProgramData = useCallback(async (programId: string) => {
    if (!session?.access_token) return;

    try {
      setInitialLoading(true);

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

      if (!programResponse.ok) throw new Error('Program yüklenemedi');
      const programData = await programResponse.json();
      const program = programData[0];
      if (!program) throw new Error('Program bulunamadı');

      const [featuresRes, faqsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/program_features?program_id=eq.${programId}&order=sort_order.asc&select=*`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${SUPABASE_URL}/rest/v1/program_faqs?program_id=eq.${programId}&order=sort_order.asc&select=*`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
        })
      ]);

      const features = featuresRes.ok ? await featuresRes.json() : [];
      const faqs = faqsRes.ok ? await faqsRes.json() : [];

      const programFeatures = features?.filter((f: any) => f.feature_type === 'feature') || [];
      const programOutcomes = features?.filter((f: any) => f.feature_type === 'outcome') || [];

      const metadata = program.metadata || {};
      
      const pricingOptions = metadata.pricing_options?.map((opt: any) => ({
        id: opt.id,
        title: opt.title,
        price: opt.price,
        description: opt.description,
        details: Array.isArray(opt.details) ? opt.details.join('\n') : (opt.details || ''),
        iyzilink: opt.iyzilink || '',
        sendpulse_course_id: opt.sendpulse_course_id || ''
      })) || [];

      const customFields = metadata.custom_fields?.map((field: any) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || '',
        options: Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')
      })) || [];

      const programDates = metadata.program_dates?.map((date: any) => ({
        id: date.id,
        title: date.title,
        status: date.status || 'active',
        label: date.label || 'collecting'
      })) || [];

      const upsells = metadata.upsells?.map((u: any) => ({
        id: u.id,
        target_program_id: u.target_program_id,
        title: u.title,
        description: u.description,
        discounted_price: u.discounted_price,
        iyzilink: u.iyzilink || '',
        sendpulse_course_id: u.sendpulse_course_id || ''
      })) || [];

      reset({
        title: program.title,
        short_title: program.short_title || '',
        title_en: program.title_en || '',
        age_group: program.age_group,
        age_range: program.age_range,
        description: program.description,
        price: program.price,
        iyzilink: program.iyzilink || '',
        sendpulse_id: program.sendpulse_id || '',
        duration: program.duration,
        schedule: program.schedule,
        lessons_per_week: program.lessons_per_week || 1,
        lesson_duration: program.lesson_duration || '',
        max_students: program.max_students || 10,
        status: program.status || 'draft',
        featured: program.featured || false,
        sort_order: program.sort_order || 0,
        features: programFeatures.length > 0 ? programFeatures.map((f: any) => ({ text: f.feature_text })) : [{ text: '' }],
        outcomes: programOutcomes.length > 0 ? programOutcomes.map((f: any) => ({ text: f.feature_text })) : [{ text: '' }],
        faqs: faqs.length > 0 ? faqs.map((f: any) => ({ question: f.question, answer: f.answer })) : [{ question: '', answer: '' }],
        pricing_options: pricingOptions,
        custom_fields: customFields,
        program_dates: programDates,
        upsells: upsells,
        metadata: metadata
      });

      if (program.image_url) {
        setExistingImageUrl(program.image_url);
        setImagePreview(program.image_url);
      }

    } catch (err) {
      console.error('Error loading program:', err);
      showNotification('error', 'Program yüklenirken bir hata oluştu');
    } finally {
      setInitialLoading(false);
    }
  }, [reset, session?.access_token]);

  useEffect(() => {
    const init = async () => {
      if (session?.access_token) {
        await fetchAvailablePrograms();
        if (isEditMode && id) {
          await loadProgramData(id);
        } else {
          setInitialLoading(false);
        }
      }
    };
    init();
  }, [id, isEditMode, session?.access_token, loadProgramData, fetchAvailablePrograms]);

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
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl('');
  };

  const generateSlug = (title: string): string => {
    return title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const uploadImage = async (file: File, programId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${programId}-${Date.now()}.${fileExt}`;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/program-images/${fileName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error('Resim yüklenemedi');
    return `${SUPABASE_URL}/storage/v1/object/public/program-images/${fileName}`;
  };

  const handleAddPricingOption = () => {
    const currentOptions = getValues('pricing_options');
    const isFirst = currentOptions.length === 0;
    
    if (isFirst) {
      const mainTitle = getValues('title');
      const mainPrice = getValues('price');
      const mainIyzilink = getValues('iyzilink');
      const mainSendPulseId = getValues('sendpulse_id');

      appendPricingOption({ 
        id: '', 
        title: mainTitle ? `${mainTitle} (Ana Paket)` : 'Ana Program Paketi', 
        price: Number(mainPrice) || 0, 
        description: 'Programın tamamını kapsayan standart paket.', 
        details: 'Tüm içeriklere erişim\nSüresiz kullanım hakkı\nSertifika', 
        iyzilink: mainIyzilink || '', 
        sendpulse_course_id: mainSendPulseId || '' 
      });
    } else {
      appendPricingOption({ 
        id: '', 
        title: '', 
        price: 0, 
        description: '', 
        details: '', 
        iyzilink: '', 
        sendpulse_course_id: '' 
      });
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

      const slugCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/programs?slug=eq.${slug}&select=id${isEditMode && id ? `&id=neq.${id}` : ''}`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` } }
      );
      const existing = await slugCheck.json();
      if (existing?.length > 0) {
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
          showNotification('error', 'Resim yüklenirken hata oluştu');
          setLoading(false);
          return;
        }
      }

      const updatedMetadata = {
        ...data.metadata,
        pricing_options: data.pricing_options.map(opt => ({
          id: opt.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: opt.title,
          price: Number(opt.price),
          description: opt.description,
          details: opt.details.split('\n').filter(line => line.trim() !== ''),
          iyzilink: opt.iyzilink,
          sendpulse_course_id: opt.sendpulse_course_id
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
        })),
        upsells: data.upsells.map(u => ({
          id: u.id || `upsell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          target_program_id: u.target_program_id,
          title: u.title,
          description: u.description,
          discounted_price: Number(u.discounted_price),
          iyzilink: u.iyzilink,
          sendpulse_course_id: u.sendpulse_course_id
        }))
      };

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
        sendpulse_id: data.sendpulse_id || null,
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
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/programs?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(programData),
        });
        if (!updateRes.ok) throw new Error('Güncelleme başarısız');
        programId = id;

        await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/program_features?program_id=eq.${id}`, {
            method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
          }),
          fetch(`${SUPABASE_URL}/rest/v1/program_faqs?program_id=eq.${id}`, {
            method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
          })
        ]);
      } else {
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/programs`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(programData),
        });
        if (!createRes.ok) throw new Error('Oluşturma başarısız');
        const newProgram = await createRes.json();
        programId = newProgram[0].id;
      }

      const features = data.features.filter(f => f.text.trim());
      const outcomes = data.outcomes.filter(o => o.text.trim());
      const faqs = data.faqs.filter(f => f.question.trim() && f.answer.trim());

      if (features.length) {
        await fetch(`${SUPABASE_URL}/rest/v1/program_features`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(features.map((f, i) => ({ program_id: programId, feature_text: f.text, feature_type: 'feature', sort_order: i })))
        });
      }
      if (outcomes.length) {
        await fetch(`${SUPABASE_URL}/rest/v1/program_features`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(outcomes.map((o, i) => ({ program_id: programId, feature_text: o.text, feature_type: 'outcome', sort_order: i })))
        });
      }
      if (faqs.length) {
        await fetch(`${SUPABASE_URL}/rest/v1/program_faqs`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(faqs.map((f, i) => ({ program_id: programId, question: f.question, answer: f.answer, sort_order: i })))
        });
      }

      showNotification('success', isEditMode ? 'Program güncellendi' : 'Program oluşturuldu');
      setTimeout(() => navigate('/admin/programs'), 1500);
    } catch (err) {
      console.error('Save error:', err);
      showNotification('error', 'Kaydetme sırasında hata oluştu');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
    <div className="space-y-6 pb-20">
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
              {isEditMode ? 'Mevcut programı düzenleyin' : 'Yeni bir eğitim programı oluşturun'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto hover:opacity-70"><X className="h-4 w-4" /></button>
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
                <Label htmlFor="title">Program Başlığı (TR) *</Label>
                <Input id="title" {...register('title', { required: 'Zorunlu' })} placeholder="Örn: Bebeğimle Evde İngilizce" />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_title">Kısa Başlık *</Label>
                <Input id="short_title" {...register('short_title', { required: 'Zorunlu' })} placeholder="Örn: Baby English" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">Program Başlığı (EN)</Label>
              <Input id="title_en" {...register('title_en')} placeholder="Örn: Baby English at Home" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age_group">Yaş Grubu *</Label>
                <Select value={watch('age_group')} onValueChange={(v) => setValue('age_group', v)}>
                  <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                  <SelectContent>
                    {ageGroupsLoading ? <div className="p-2">Yükleniyor...</div> : ageGroups.map(g => <SelectItem key={g.id} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_range">Yaş Aralığı</Label>
                <Input id="age_range" {...register('age_range')} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea id="description" {...register('description', { required: 'Zorunlu' })} rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Program Görseli</CardTitle>
            <CardDescription>Max 5MB, JPG/PNG</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2"><X className="h-4 w-4 mr-2" />Kaldır</Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Görsel yüklemek için tıklayın</p>
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" />
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} /></div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle>Program Detayları</CardTitle>
            <CardDescription>Ders programı ve fiyatlandırma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Varsayılan Fiyat (₺) *</Label>
                <Input id="price" type="number" step="0.01" {...register('price', { required: 'Zorunlu', min: 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iyzilink" className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> İyzico Linki</Label>
                <Input id="iyzilink" {...register('iyzilink')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sendpulse_id" className="flex items-center gap-2"><Database className="h-4 w-4" /> SendPulse ID</Label>
                <Input id="sendpulse_id" {...register('sendpulse_id')} placeholder="CRM ID" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Süre *</Label>
                <Input id="duration" {...register('duration', { required: 'Zorunlu' })} placeholder="Örn: 12 hafta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Program *</Label>
                <Input id="schedule" {...register('schedule', { required: 'Zorunlu' })} placeholder="Örn: Haftada 2 ders" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessons_per_week">Haftalık Ders</Label>
                <Input id="lessons_per_week" type="number" {...register('lessons_per_week', { required: 'Zorunlu', min: 1 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson_duration">Ders Süresi</Label>
                <Input id="lesson_duration" {...register('lesson_duration', { required: 'Zorunlu' })} placeholder="30 dk" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Max Öğrenci</Label>
                <Input id="max_students" type="number" {...register('max_students', { required: 'Zorunlu', min: 1 })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Options */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle>Fiyatlandırma Seçenekleri (Paketler)</CardTitle>
            </div>
            <CardDescription>Farklı paket seçenekleri (Örn: 12 Ders / 24 Ders)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pricingOptionFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" onClick={() => removePricingOption(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <div className="space-y-2">
                    <Label>Paket Başlığı</Label>
                    <Input {...register(`pricing_options.${index}.title` as const, { required: true })} placeholder="Örn: 12 Derslik Paket" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fiyat (₺)</Label>
                    <Input type="number" {...register(`pricing_options.${index}.price` as const, { required: true })} />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><LinkIcon className="h-3 w-3" /> Paket Ödeme Linki (Iyzilink)</Label>
                    <Input {...register(`pricing_options.${index}.iyzilink` as const)} placeholder="https://iyzi.link/..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Database className="h-3 w-3" /> SendPulse Kurs ID</Label>
                    <Input {...register(`pricing_options.${index}.sendpulse_course_id` as const)} placeholder="CRM ID" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kısa Açıklama</Label>
                  <Input {...register(`pricing_options.${index}.description` as const)} />
                </div>
                <div className="space-y-2">
                  <Label>Detaylar (Her satıra bir özellik)</Label>
                  <Textarea {...register(`pricing_options.${index}.details` as const)} rows={3} className="font-mono text-sm" />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddPricingOption} className="w-full border-dashed border-2 py-6">
              <Plus className="h-4 w-4 mr-2" /> Yeni Paket Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Upsell Options (NEW) */}
        <Card className="border-pink-200 bg-pink-50/50 dark:bg-pink-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-600" />
              <CardTitle>Birlikte Alınabilecek Eğitimler (Upsell)</CardTitle>
            </div>
            <CardDescription>
              Kullanıcı bu eğitimi satın alırken, sepetine indirimli olarak ekleyebileceği diğer eğitimleri buradan seçebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {upsellFields.map((field, index) => {
              const selectedProgramId = watch(`upsells.${index}.target_program_id`);
              const selectedProgram = availablePrograms.find(p => p.id === selectedProgramId);
              const discountedPrice = watch(`upsells.${index}.discounted_price`);
              const discountRate = selectedProgram && selectedProgram.price > 0 
                ? Math.round(((selectedProgram.price - discountedPrice) / selectedProgram.price) * 100) 
                : 0;

              return (
                <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeUpsell(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  
                  <div className="grid md:grid-cols-2 gap-4 pr-8">
                    <div className="space-y-2">
                      <Label>Önerilecek Eğitim</Label>
                      <Select 
                        value={watch(`upsells.${index}.target_program_id`)} 
                        onValueChange={(val) => {
                          setValue(`upsells.${index}.target_program_id`, val);
                          const prog = availablePrograms.find(p => p.id === val);
                          if (prog) {
                            setValue(`upsells.${index}.title`, `Birlikte Al: ${prog.title}`);
                            setValue(`upsells.${index}.discounted_price`, Math.floor(prog.price * 0.8));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Eğitim seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePrograms.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.title} ({p.price}₺)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Kampanya Başlığı</Label>
                      <Input {...register(`upsells.${index}.title` as const, { required: true })} placeholder="Örn: Bu eğitimi de ekle, %20 kazan!" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Normal Fiyat</Label>
                      <Input disabled value={selectedProgram?.price || 0} className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-pink-600 font-bold">İndirimli Fiyat (₺)</Label>
                      <Input type="number" {...register(`upsells.${index}.discounted_price` as const, { required: true, min: 0 })} />
                    </div>
                    <div className="flex items-center pt-6">
                      {discountRate > 0 && (
                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <TrendingUp className="h-4 w-4" />
                          %{discountRate} İndirim
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><LinkIcon className="h-3 w-3" /> Özel Ödeme Linki (Iyzilink)</Label>
                      <Input {...register(`upsells.${index}.iyzilink` as const)} placeholder="https://iyzi.link/..." />
                      <p className="text-xs text-gray-500">Bu upsell seçilirse ana link yerine bu kullanılır.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Database className="h-3 w-3" /> SendPulse Kurs ID</Label>
                      <Input {...register(`upsells.${index}.sendpulse_course_id` as const)} placeholder="CRM ID" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Açıklama (Opsiyonel)</Label>
                    <Input {...register(`upsells.${index}.description` as const)} placeholder="Örn: İki eğitimi birlikte alarak avantaj sağla." />
                  </div>
                </div>
              );
            })}
            
            <Button type="button" variant="outline" onClick={() => appendUpsell({ id: '', target_program_id: '', title: '', description: '', discounted_price: 0, iyzilink: '', sendpulse_course_id: '' })} className="w-full border-dashed border-2 py-6 border-pink-200 text-pink-700 hover:bg-pink-50">
              <Plus className="h-4 w-4 mr-2" /> Yeni Fırsat Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Program Dates */}
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <CardTitle>Eğitim Tarihleri</CardTitle>
            </div>
            <CardDescription>Eğitimin açılacağı dönemler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {programDateFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeProgramDate(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <div className="space-y-2">
                    <Label>Dönem Açıklaması</Label>
                    <Input {...register(`program_dates.${index}.title` as const, { required: true })} placeholder="Örn: 15 Ekim Grubu" />
                  </div>
                  <div className="space-y-2">
                    <Label>Durum Etiketi</Label>
                    <Select value={watch(`program_dates.${index}.label`)} onValueChange={(v: any) => setValue(`program_dates.${index}.label`, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collecting">Talep Toplanıyor</SelectItem>
                        <SelectItem value="active">Aktif (Kayıt Açık)</SelectItem>
                        <SelectItem value="full">Doldu</SelectItem>
                        <SelectItem value="soon">Yakında</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={watch(`program_dates.${index}.status`) === 'active'} onCheckedChange={(c) => setValue(`program_dates.${index}.status`, c ? 'active' : 'passive')} />
                  <Label>{watch(`program_dates.${index}.status`) === 'active' ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Yayında</span> : <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Pasif</span>}</Label>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendProgramDate({ id: '', title: '', status: 'active', label: 'collecting' })} className="w-full border-dashed border-2 py-6 border-orange-200 text-orange-700 hover:bg-orange-50">
              <Plus className="h-4 w-4 mr-2" /> Yeni Tarih Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <CardTitle>Özel Kayıt Alanları</CardTitle>
            </div>
            <CardDescription>Kayıt sırasında istenecek ek bilgiler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {customFieldFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <div className="space-y-2">
                    <Label>Alan Başlığı</Label>
                    <Input {...register(`custom_fields.${index}.label` as const, { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Veri Tipi</Label>
                    <Select value={watch(`custom_fields.${index}.type`)} onValueChange={(v: any) => setValue(`custom_fields.${index}.type`, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text"><div className="flex gap-2"><Type className="h-4 w-4" /> Kısa Metin</div></SelectItem>
                        <SelectItem value="textarea"><div className="flex gap-2"><AlignLeft className="h-4 w-4" /> Uzun Metin</div></SelectItem>
                        <SelectItem value="number"><div className="flex gap-2"><span>123</span> Sayı</div></SelectItem>
                        <SelectItem value="date"><div className="flex gap-2"><Calendar className="h-4 w-4" /> Tarih</div></SelectItem>
                        <SelectItem value="select"><div className="flex gap-2"><List className="h-4 w-4" /> Seçim</div></SelectItem>
                        <SelectItem value="checkbox"><div className="flex gap-2"><CheckSquare className="h-4 w-4" /> Onay</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İpucu (Placeholder)</Label>
                    <Input {...register(`custom_fields.${index}.placeholder` as const)} />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch checked={watch(`custom_fields.${index}.required`)} onCheckedChange={(c) => setValue(`custom_fields.${index}.required`, c)} />
                    <Label>Zorunlu Alan</Label>
                  </div>
                </div>
                {watch(`custom_fields.${index}.type`) === 'select' && (
                  <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Seçenekler (Virgülle ayırın)</Label>
                    <Input {...register(`custom_fields.${index}.options` as const)} />
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendCustomField({ id: '', label: '', type: 'text', required: false, placeholder: '', options: '' })} className="w-full border-dashed border-2 py-6 border-purple-200 text-purple-700 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-2" /> Yeni Kayıt Alanı Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Features & Outcomes & FAQs */}
        <Card>
          <CardHeader><CardTitle>İçerik Detayları</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Özellikler</Label>
              {featureFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`features.${index}.text`)} placeholder="Özellik..." />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendFeature({ text: '' })} className="w-full"><Plus className="h-4 w-4 mr-2" /> Ekle</Button>
            </div>
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Öğrenme Çıktıları</Label>
              {outcomeFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`outcomes.${index}.text`)} placeholder="Çıktı..." />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeOutcome(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendOutcome({ text: '' })} className="w-full"><Plus className="h-4 w-4 mr-2" /> Ekle</Button>
            </div>
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Sıkça Sorulan Sorular</Label>
              {faqFields.map((field, index) => (
                <div key={field.id} className="space-y-2 p-4 border rounded-lg relative">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(index)} className="absolute top-2 right-2"><Trash2 className="h-4 w-4" /></Button>
                  <Input {...register(`faqs.${index}.question`)} placeholder="Soru..." className="pr-10" />
                  <Textarea {...register(`faqs.${index}.answer`)} placeholder="Cevap..." rows={2} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendFaq({ question: '', answer: '' })} className="w-full"><Plus className="h-4 w-4 mr-2" /> Ekle</Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader><CardTitle>Yayın Ayarları</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={watch('status')} onValueChange={(v: any) => setValue('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="archived">Arşiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sıralama</Label>
                <Input id="sort_order" type="number" {...register('sort_order')} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="featured">Öne Çıkan Program</Label>
                <p className="text-sm text-gray-500">Anasayfada vitrinde gösterilir.</p>
              </div>
              <Switch id="featured" checked={watch('featured')} onCheckedChange={(c) => setValue('featured', c)} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t shadow-lg z-10">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/programs')}>İptal</Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Kaydediliyor...</> : <><Save className="h-4 w-4 mr-2" /> {isEditMode ? 'Güncelle' : 'Oluştur'}</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProgramForm;
