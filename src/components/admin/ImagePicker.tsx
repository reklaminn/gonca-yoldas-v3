import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Upload, Loader2, Check, Trash2 } from 'lucide-react';
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

  // Load images from storage
  const loadImages = async () => {
    try {
      setLoadingImages(true);
      const { data, error } = await supabase.storage
        .from('content-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Resimler yüklenirken hata oluştu');
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast.success('Resim yüklendi');
      await loadImages(); // Refresh list
      
      // Auto select uploaded image
      const publicUrl = getPublicUrl(fileName);
      setSelectedImage(publicUrl);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Resim yüklenemedi');
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
      loadImages();
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
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Kütüphane</TabsTrigger>
            <TabsTrigger value="upload">Yeni Yükle</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-y-auto p-4 border rounded-md mt-2">
            {loadingImages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                <p>Henüz resim yüklenmemiş</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((file) => {
                  const url = getPublicUrl(file.name);
                  const isSelected = selectedImage === url;

                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "relative group aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
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
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="bg-blue-500 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
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
