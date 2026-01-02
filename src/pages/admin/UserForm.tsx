import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  User,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
}

const UserForm: React.FC = () => {
  console.log('🎯 [UserForm] Component mounting...');
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { session } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      role: 'student',
    },
  });

  // Load existing user data in edit mode
  useEffect(() => {
    console.log('📝 [UserForm] useEffect triggered, isEditMode:', isEditMode, 'id:', id);
    
    if (!isEditMode || !id) {
      console.log('ℹ️ [UserForm] Not edit mode or no ID, skipping load');
      setInitialLoading(false);
      return;
    }

    if (!session?.access_token) {
      console.error('❌ [UserForm] No access token');
      toast.error('Oturum bilgisi bulunamadı');
      setInitialLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        console.log('📝 [UserForm] Loading user:', id);
        setInitialLoading(true);

        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [UserForm] Fetch failed:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const user = data[0];

        if (!user) {
          console.error('❌ [UserForm] User not found');
          throw new Error('Kullanıcı bulunamadı');
        }

        console.log('✅ [UserForm] User loaded:', user.email);

        // Reset form with user data
        reset({
          email: user.email,
          full_name: user.full_name || '',
          phone: user.phone || '',
          role: user.role || 'student',
        });

        console.log('✅ [UserForm] Form data loaded successfully');
      } catch (err: any) {
        console.error('❌ [UserForm] Error loading user:', err);
        showNotification('error', 'Kullanıcı yüklenirken hata: ' + err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [id, isEditMode, session?.access_token, reset]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const onSubmit = async (data: UserFormData) => {
    console.log('💾 [UserForm] Saving user...', data);
    
    if (!session?.access_token) {
      console.error('❌ [UserForm] No access token');
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);

      // Prepare user data
      const userData = {
        full_name: data.full_name,
        phone: data.phone || null,
        role: data.role,
        updated_at: new Date().toISOString(),
      };

      console.log('📤 [UserForm] Sending update:', userData);

      if (isEditMode && id) {
        // Update existing user
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(userData),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('❌ [UserForm] Update failed:', updateResponse.status, errorText);
          throw new Error('Kullanıcı güncellenemedi');
        }

        const updatedUser = await updateResponse.json();
        console.log('✅ [UserForm] User updated:', updatedUser);

        showNotification('success', 'Kullanıcı başarıyla güncellendi');
      } else {
        // Create new user - Note: This requires auth.users table access
        // For now, we'll show an error as user creation should be done via Supabase Auth
        showNotification('error', 'Yeni kullanıcı oluşturma henüz desteklenmiyor. Lütfen Supabase Auth kullanın.');
        setLoading(false);
        return;
      }

      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err: any) {
      console.error('❌ [UserForm] Save error:', err);
      showNotification('error', err.message || 'Kullanıcı kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?')) {
      navigate('/admin/users');
    }
  };

  console.log('📝 [UserForm] Rendering, initialLoading:', initialLoading, 'loading:', loading);

  // Show loading spinner while fetching data in edit mode
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Kullanıcı yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode
                ? 'Mevcut kullanıcıyı düzenleyin'
                : 'Yeni bir kullanıcı oluşturun'}
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
            <CardDescription>Kullanıcı hakkında temel bilgileri girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                E-posta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Bu alan zorunludur',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçerli bir e-posta adresi girin'
                  }
                })}
                placeholder="ornek@email.com"
                disabled={isEditMode}
                className={isEditMode ? 'bg-gray-100 dark:bg-gray-800' : ''}
              />
              {isEditMode && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  E-posta adresi düzenlenemez
                </p>
              )}
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Ad Soyad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                {...register('full_name', { required: 'Bu alan zorunludur' })}
                placeholder="Ahmet Yılmaz"
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                Telefon
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+90 532 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('role')}
                onValueChange={(value) => setValue('role', value as 'student' | 'instructor' | 'admin')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Öğrenci</SelectItem>
                  <SelectItem value="instructor">Eğitmen</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kullanıcının sistemdeki yetkilerini belirler
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        {!isEditMode && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Yeni Kullanıcı Oluşturma
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Yeni kullanıcılar şu anda Supabase Auth üzerinden oluşturulmalıdır. 
                    Bu form sadece mevcut kullanıcıları düzenlemek için kullanılabilir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={loading || !isEditMode}
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

export default UserForm;
