import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Trash2, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface PaymentBadgeUploaderProps {
  currentBadgeUrl: string;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export const PaymentBadgeUploader: React.FC<PaymentBadgeUploaderProps> = ({
  currentBadgeUrl,
  onUploadSuccess,
  className
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentBadgeUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { session: storeSession, profile: storeProfile } = useAuthStore();

  // 🆕 DOĞRUDAN YÜKLEME FONKSİYONU (Fallback)
  // Supabase JS istemcisi takılırsa bu fonksiyon devreye girer
  const uploadDirectly = async (file: File, fileName: string, token: string) => {
    console.log('🚀 [DirectUpload] Başlatılıyor (Fallback)...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase konfigürasyonu eksik');

    const url = `${supabaseUrl}/storage/v1/object/payment-badges/${fileName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
        'x-upsert': 'false',
        // Content-Type'ı browser otomatik ayarlar veya manuel verebiliriz
        // 'Content-Type': file.type 
      },
      body: file
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [DirectUpload] Hata:', response.status, errorData);
      throw new Error(`Yükleme başarısız: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [DirectUpload] Başarılı:', data);
    return data;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🟢 [PaymentBadgeUploader] Dosya seçildi:', file.name);

    // Validasyonlar
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece PNG, JPG, SVG veya WebP formatları desteklenir');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dosya boyutu 2MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setUploading(true);

      // 1. Yetki Kontrolü (Store üzerinden hızlı kontrol)
      if (!storeSession?.access_token) {
        throw new Error('Oturum süreniz dolmuş olabilir. Lütfen sayfayı yenileyip tekrar giriş yapın.');
      }

      if (storeProfile?.role !== 'admin') {
        throw new Error('Bu işlem için admin yetkisi gereklidir.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `payment-badge-${Date.now()}.${fileExt}`;

      console.log('🟢 [Upload] Yükleme başlıyor...');
      console.log('🔵 [Upload] Hedef:', fileName);

      // 2. Yükleme Denemesi (Önce Standart, Sonra Fallback)
      let uploadError = null;
      let uploadData = null;

      try {
        // Yöntem A: Standart Supabase Upload (15sn Timeout ile)
        const uploadPromise = supabase.storage
          .from('payment-badges')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        // 15 saniye içinde yanıt gelmezse hata fırlat
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        );

        const result: any = await Promise.race([uploadPromise, timeoutPromise]);
        
        if (result.error) throw result.error;
        uploadData = result.data;
        console.log('✅ [Upload] Standart yöntem başarılı');

      } catch (err: any) {
        console.warn('⚠️ [Upload] Standart yöntem başarısız veya zaman aşımı:', err.message || err);
        console.log('🔄 [Upload] Doğrudan yükleme (Direct Upload) deneniyor...');
        
        // Yöntem B: Doğrudan Fetch ile Yükleme (Fallback)
        try {
          await uploadDirectly(file, fileName, storeSession.access_token);
          // Fetch başarılı olursa data yapısını simüle et
          uploadData = { path: fileName };
          console.log('✅ [Upload] Doğrudan yükleme başarılı');
        } catch (directErr: any) {
          console.error('❌ [Upload] Doğrudan yükleme de başarısız:', directErr);
          throw new Error(`Yükleme hatası: ${directErr.message}`);
        }
      }

      // 3. Public URL Al
      const { data: urlData } = supabase.storage
        .from('payment-badges')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('✅ [Upload] Public URL:', publicUrl);

      setPreviewUrl(publicUrl);
      onUploadSuccess(publicUrl);
      toast.success('Badge başarıyla yüklendi');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('❌ [Upload] Kritik Hata:', error);
      toast.error(error.message || 'Yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!previewUrl) return;
    if (!confirm('Bu badge\'i silmek istediğinizden emin misiniz?')) return;

    try {
      setDeleting(true);
      const urlParts = previewUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from('payment-badges')
        .remove([fileName]);

      if (error) throw error;

      setPreviewUrl('');
      onUploadSuccess('');
      toast.success('Badge silindi');
    } catch (error: any) {
      toast.error(`Silme hatası: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const isSupabaseUrl = previewUrl?.includes('supabase.co/storage');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-gray-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Ödeme Sağlayıcı Badge
        </Label>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {previewUrl ? 'Yeni Badge Yükle' : 'Badge Yükle'}
              </>
            )}
          </Button>

          {previewUrl && isSupabaseUrl && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              title="Badge'i Sil"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          PNG, JPG, SVG veya WebP (Max 2MB)
        </p>
      </div>

      {previewUrl && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Önizleme:</p>
            {isSupabaseUrl ? (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                Supabase Storage
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                Harici URL
              </div>
            )}
          </div>
          <img
            src={previewUrl}
            alt="Payment Badge Preview"
            className="h-12 object-contain bg-white dark:bg-gray-900 p-2 rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
