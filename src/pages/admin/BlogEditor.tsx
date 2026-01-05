import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, WifiOff, RefreshCw, Wand2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImagePicker } from '@/components/admin/ImagePicker';

// --- DOĞRUDAN FETCH YARDIMCI FONKSİYONLARI ---

async function fetchFromSupabase(tableName: string, query: string = ''): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${tableName}?${query}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function saveToSupabase(tableName: string, data: any, id: string | null = null): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isUpdate = !!id;
  const method = isUpdate ? 'PATCH' : 'POST';
  
  let url = `${supabaseUrl}/rest/v1/${tableName}`;
  if (isUpdate) {
    url += `?id=eq.${id}`;
  }
  
  const response = await fetch(url, {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kayıt başarısız: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// -------------------------------------------

const BlogEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const mounted = useRef(true);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category_id: '',
    is_published: true,
    is_featured: false,
    read_time: '5 dakika'
  });

  useEffect(() => {
    mounted.current = true;
    initializeEditor();
    return () => { mounted.current = false; };
  }, [id]);

  // İçerik değiştiğinde okuma süresini hesapla
  useEffect(() => {
    if (formData.content) {
      const time = calculateReadingTime(formData.content);
      setFormData(prev => {
        // Sadece değiştiyse güncelle (sonsuz döngüyü önle)
        if (prev.read_time !== time) return { ...prev, read_time: time };
        return prev;
      });
    }
  }, [formData.content]);

  const initializeEditor = async () => {
    setLoading(true);
    setIsDemoMode(false);
    try {
      await fetchCategoriesWithFallback();
      if (isEditing) {
        await fetchPostWithFallback();
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const fetchCategoriesWithFallback = async () => {
    try {
      const data = await fetchFromSupabase('blog_categories', 'select=*');
      if (mounted.current) setCategories(data || []);
    } catch (error) {
      console.error('Kategori hatası:', error);
      if (mounted.current) setIsDemoMode(true);
    }
  };

  const fetchPostWithFallback = async () => {
    try {
      const data = await fetchFromSupabase('blog_posts', `id=eq.${id}&select=*`);
      if (data && data.length > 0 && mounted.current) {
        fillForm(data[0]);
      }
    } catch (error) {
      console.error('Yazı hatası:', error);
      if (mounted.current) setIsDemoMode(true);
    }
  };

  const fillForm = (data: any) => {
    setFormData({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      image_url: data.image_url || '',
      category_id: data.category_id || '',
      is_published: data.is_published,
      is_featured: data.is_featured,
      read_time: data.read_time || '5 dakika'
    });
  };

  // --- YARDIMCI FONKSİYONLAR ---

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const calculateReadingTime = (htmlContent: string) => {
    // HTML etiketlerini temizle
    const text = htmlContent.replace(/<[^>]*>/g, '').replace(/<[^>]*>/g, ' ');
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} dakika`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      // Sadece yeni yazı oluştururken slug'ı otomatik güncelle
      slug: !isEditing ? generateSlug(title) : prev.slug
    }));
  };

  const handleRegenerateSlug = () => {
    if (!formData.title) {
      toast.error('Önce bir başlık girmelisiniz');
      return;
    }
    const newSlug = generateSlug(formData.title);
    setFormData(prev => ({ ...prev, slug: newSlug }));
    toast.success('URL başlığa göre güncellendi');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isDemoMode) {
      setTimeout(() => {
        toast.success('Demo modunda işlem başarılı');
        setLoading(false);
        navigate('/admin/content/blog');
      }, 1000);
      return;
    }

    try {
      const postData: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: formData.image_url,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        read_time: formData.read_time,
        updated_at: new Date().toISOString()
      };

      if (formData.category_id && formData.category_id.trim() !== '') {
        postData.category_id = formData.category_id;
      } else {
        postData.category_id = null;
      }

      await saveToSupabase('blog_posts', postData, isEditing ? id : null);

      toast.success(isEditing ? 'Yazı güncellendi' : 'Yazı oluşturuldu');
      navigate('/admin/content/blog');
      
    } catch (error: any) {
      console.error('Kaydetme hatası:', error);
      toast.error('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !formData.title) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/content/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
            </h1>
            {isDemoMode && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                <WifiOff className="h-3 w-3 mr-1" />
                Demo
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Kaydet
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Yazı başlığı..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL (Slug)</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="yazi-basligi-url"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={handleRegenerateSlug}
                    title="Başlıktan Otomatik Oluştur"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  SEO dostu URL yapısı. Otomatik oluşturulabilir veya elle düzenlenebilir.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Yazının kısa özeti..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">İçerik</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  className="min-h-[400px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yayın Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Yayında</Label>
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Öne Çıkan</Label>
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readTime">Okuma Süresi</Label>
                <div className="relative">
                  <Input
                    id="readTime"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="Örn: 5 dakika"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400" title="Otomatik hesaplandı">
                    <Wand2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  İçerik uzunluğuna göre otomatik hesaplanır.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Görsel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kapak Görseli</Label>
                <ImagePicker 
                  value={formData.image_url} 
                  onChange={(url) => setFormData({ ...formData, image_url: url })} 
                />
              </div>
              
              {formData.image_url && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border relative group">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.parentElement?.classList.add('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      Görseli Kaldır
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
