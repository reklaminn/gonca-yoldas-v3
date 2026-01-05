import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Upload, Loader2, Check, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  trigger?: React.ReactNode;
}

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [images, setImages] = useState<StorageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Timeout referansı
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load images from storage with Timeout and Fallback
  const loadImages = async () => {
    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoadingImages(true);
      setErrorMsg(null);
      console.log('📂 [ImagePicker] Resimler yükleniyor...');

      // 1. Yöntem: Supabase SDK (Süreyi 2 saniyeye düşürdük - Daha hızlı tepki)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SDK Yanıt vermedi (2sn)')), 2000)
      );

      const fetchPromise = supabase.storage
        .from('content-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      // Yarıştır: SDK vs Timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw error;

      console.log(`✅ [ImagePicker] SDK ile ${data?.length || 0} resim yüklendi.`);
      setImages(data || []);

    } catch (error: any) {
      // Hata beklenen bir durum olabilir (Timeout), panik yapma
      console.warn('⚠️ [ImagePicker] SDK Yöntemi atlanıyor:', error.message);
      
      console.log('🔄 [ImagePicker] Alternatif yöntem devreye giriyor (Direct REST)...');
      try {
        await loadImagesFallback();
      } catch (fallbackError: any) {
        console.error('❌ [ImagePicker] Tüm yöntemler başarısız:', fallbackError);
        setErrorMsg('Resimler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
        toast.error('Resim listesi alınamadı.');
      }
    } finally {
      setLoadingImages(false);
    }
  };

  // Alternatif Yükleme Yöntemi (Direct REST API)
  const loadImagesFallback = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase ayarları eksik');

    const response = await fetch(`${supabaseUrl}/storage/v1/object/list/content-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'ApiKey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prefix: '',
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Hatası: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    console.log(`✅ [ImagePicker] Alternatif yöntem ile ${data?.length || 0} resim yüklendi.`);
    setImages(data || []);
  };

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg(null);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast.success('Resim başarıyla yüklendi');
      await loadImages(); 
      
      const publicUrl = getPublicUrl(fileName);
      setSelectedImage(publicUrl);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Yükleme hatası: ' + error.message);
      setErrorMsg('Yükleme başarısız: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.storage
        .from('content-images')
        .remove([fileName]);

      if (error) throw error;

      toast.success('Resim silindi');
      // Listeyi yerel olarak güncelle (tekrar fetch yapmadan)
      setImages(prev => prev.filter(img => img.name !== fileName));
      if (selectedImage?.includes(fileName)) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Resim silinemedi');
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('content-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSelect = () => {
    if (selectedImage) {
      onChange(selectedImage);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <ImageIcon className="h-4 w-4 mr-2" />
            Resim Seç / Yükle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Medya Kütüphanesi</DialogTitle>
          {/* Erişilebilirlik uyarısını düzeltmek için gizli açıklama */}
          <DialogDescription className="hidden">
            Blog yazılarınız için resim seçin veya yeni resim yükleyin.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Kütüphane</TabsTrigger>
            <TabsTrigger value="upload">Yeni Yükle</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-y-auto p-4 border rounded-md mt-2 relative bg-white dark:bg-gray-950">
            {/* Refresh Button */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={loadImages} 
                disabled={loadingImages}
                title="Listeyi Yenile"
                className="shadow-sm"
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", loadingImages && "animate-spin")} />
                Yenile
              </Button>
            </div>

            {loadingImages ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resimler yükleniyor...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* Kullanıcıya ne olduğunu hissettirmek için dinamik mesaj */}
                    Bağlantı kontrol ediliyor...
                  </p>
                </div>
              </div>
            ) : errorMsg ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2 p-4 text-center">
                <AlertCircle className="h-10 w-10" />
                <p className="font-medium">Bir hata oluştu</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded max-w-md break-words">
                  {errorMsg}
                </p>
                <Button variant="outline" onClick={loadImages} className="mt-2">
                  Tekrar Dene
                </Button>
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                <p>Henüz resim yüklenmemiş</p>
                <Button variant="link" onClick={() => document.getElementById('upload-trigger')?.click()}>
                  İlk resmi yükle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-10">
                {images.map((file) => {
                  const url = getPublicUrl(file.name);
                  const isSelected = selectedImage === url;

                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "relative group aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all bg-gray-100 dark:bg-gray-800",
                        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
                      )}
                      onClick={() => setSelectedImage(url)}
                    >
                      <img
                        src={url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteImage(file.name, e)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-20"
                        title="Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center z-10">
                          <div className="bg-blue-500 text-white rounded-full p-1 shadow-sm">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      
                      {/* File Name Tooltip */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center border rounded-md mt-2 bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resim Yükle</h3>
              <p className="text-sm text-gray-500 mb-6">
                JPG, PNG, GIF veya WEBP (Max 5MB)
              </p>
              <div className="relative">
                <Input
                  id="upload-trigger"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    'Dosya Seç'
                  )}
                </Button>
              </div>
              {errorMsg && (
                <p className="text-red-500 text-sm mt-4">{errorMsg}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedImage ? '1 resim seçildi' : 'Resim seçilmedi'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSelect} disabled={!selectedImage}>
              Seçilen Resmi Kullan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
