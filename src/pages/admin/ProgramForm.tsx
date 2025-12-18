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
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  createProgram,
  updateProgram,
  uploadProgramImage,
  addProgramFeature,
  addProgramFAQ,
} from '@/hooks/usePrograms';

interface ProgramFormData {
  title: string;
  short_title: string;
  title_en: string;
  age_group: '0-2' | '2-5' | '5-10';
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
}

const ProgramForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

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
      age_group: '0-2',
      age_range: '0-2 Yaş',
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

  const ageGroup = watch('age_group');

  // Update age_range when age_group changes
  useEffect(() => {
    const ageRangeMap = {
      '0-2': '0-2 Yaş',
      '2-5': '2-5 Yaş',
      '5-10': '5-10 Yaş',
    };
    setValue('age_range', ageRangeMap[ageGroup]);
  }, [ageGroup]);

  // Load existing program data in edit mode
  const loadProgramData = useCallback(async (programId: string) => {
    try {
      setInitialLoading(true);

      // Fetch program
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (programError) throw programError;

      // Fetch features
      const { data: features, error: featuresError } = await supabase
        .from('program_features')
        .select('*')
        .eq('program_id', programId)
        .order('sort_order');

      if (featuresError) throw featuresError;

      // Fetch FAQs
      const { data: faqs, error: faqsError } = await supabase
        .from('program_faqs')
        .select('*')
        .eq('program_id', programId)
        .order('sort_order');

      if (faqsError) throw faqsError;

      // Prepare features and outcomes
      const programFeatures = features?.filter((f) => f.feature_type === 'feature') || [];
      const programOutcomes = features?.filter((f) => f.feature_type === 'outcome') || [];

      // Reset form with all data at once
      reset({
        title: program.title,
        short_title: program.short_title,
        title_en: program.title_en || '',
        age_group: program.age_group,
        age_range: program.age_range,
        description: program.description,
        price: program.price,
        iyzilink: program.iyzilink || '',
        duration: program.duration,
        schedule: program.schedule,
        lessons_per_week: program.lessons_per_week,
        lesson_duration: program.lesson_duration,
        max_students: program.max_students,
        status: program.status,
        featured: program.featured,
        sort_order: program.sort_order,
        features: programFeatures.length > 0
          ? programFeatures.map((f) => ({ text: f.feature_text }))
          : [{ text: '' }],
        outcomes: programOutcomes.length > 0
          ? programOutcomes.map((f) => ({ text: f.feature_text }))
          : [{ text: '' }],
        faqs: faqs && faqs.length > 0
          ? faqs.map((f) => ({ question: f.question, answer: f.answer }))
          : [{ question: '', answer: '' }],
      });

      // Set existing image
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
  }, []);

  // Load data only once on mount
  useEffect(() => {
    if (isEditMode && id) {
      loadProgramData(id);
    }
  }, [id, isEditMode, loadProgramData]);

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

  const onSubmit = async (data: ProgramFormData) => {
    try {
      setLoading(true);

      // Generate slug from title
      const slug = generateSlug(data.title);

      // Check if slug already exists (FIXED: Handle create mode properly)
      let query = supabase
        .from('programs')
        .select('id')
        .eq('slug', slug);

      // Only add ID filter in edit mode
      if (isEditMode && id) {
        query = query.neq('id', id);
      }

      const { data: existingProgram } = await query.single();

      if (existingProgram) {
        showNotification('error', 'Bu başlıkla bir program zaten mevcut');
        setLoading(false);
        return;
      }

      let imageUrl = existingImageUrl;

      // Upload image if new file selected
      if (imageFile) {
        try {
          setUploadProgress(50);
          const tempId = id || 'temp-' + Date.now();
          imageUrl = await uploadProgramImage(imageFile, tempId);
          setUploadProgress(100);
        } catch (err) {
          console.error('Error uploading image:', err);
          const errorMessage = err instanceof Error ? err.message : 'Resim yüklenirken bir hata oluştu';
          showNotification('error', errorMessage);
          setLoading(false);
          return;
        }
      }

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
      };

      let programId: string;

      if (isEditMode && id) {
        // Update existing program
        await updateProgram(id, programData);
        programId = id;

        // Delete existing features and FAQs
        await supabase.from('program_features').delete().eq('program_id', id);
        await supabase.from('program_faqs').delete().eq('program_id', id);
      } else {
        // Create new program
        const newProgram = await createProgram(programData);
        programId = newProgram.id;
      }

      // Add features
      const features = data.features.filter((f) => f.text.trim());
      for (let i = 0; i < features.length; i++) {
        await addProgramFeature(programId, features[i].text, 'feature', i);
      }

      // Add outcomes
      const outcomes = data.outcomes.filter((o) => o.text.trim());
      for (let i = 0; i < outcomes.length; i++) {
        await addProgramFeature(programId, outcomes[i].text, 'outcome', i);
      }

      // Add FAQs
      const faqs = data.faqs.filter((f) => f.question.trim() && f.answer.trim());
      for (let i = 0; i < faqs.length; i++) {
        await addProgramFAQ(programId, faqs[i].question, faqs[i].answer, i);
      }

      showNotification(
        'success',
        isEditMode ? 'Program başarıyla güncellendi' : 'Program başarıyla oluşturuldu'
      );

      setTimeout(() => {
        navigate('/admin/programs');
      }, 1500);
    } catch (err) {
      console.error('Error saving program:', err);
      const errorMessage = err instanceof Error ? err.message : 'Program kaydedilirken bir hata oluştu';
      showNotification('error', errorMessage);
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

  // Show loading spinner while fetching data in edit mode
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
                  value={ageGroup}
                  onValueChange={(value) =>
                    setValue('age_group', value as '0-2' | '2-5' | '5-10')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 Yaş</SelectItem>
                    <SelectItem value="2-5">2-5 Yaş</SelectItem>
                    <SelectItem value="5-10">5-10 Yaş</SelectItem>
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
                  Fiyat (₺) <span className="text-red-500">*</span>
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
