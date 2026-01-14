import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Star, 
  Tag, 
  Calendar, 
  Eye,
  Loader2,
  MoreVertical,
  FileText,
  RefreshCw,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category_id: string;
  is_published: boolean;
  is_featured: boolean;
  views: number;
  read_time: string;
  created_at: string;
  blog_categories: {
    name: string;
  };
}

// --- TOKEN YÖNETİMİ VE YENİLEME ---

const STORAGE_KEY = 'sb-jlwsapdvizzriomadhxj-auth-token';

async function getStoredSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('❌ [Token] LocalStorage okuma hatası:', e);
  }
  return null;
}

async function refreshAuthTokenManual() {
  console.log('🔄 [Refresh] Token yenileme işlemi başlatılıyor...');
  const session = await getStoredSession();
  
  if (!session || !session.refresh_token) {
    console.error('❌ [Refresh] Refresh token bulunamadı.');
    throw new Error('No refresh token available');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Refresh] Yenileme başarısız:', errorData);
      throw new Error(errorData.error_description || 'Token refresh failed');
    }

    const data = await response.json();
    console.log('✅ [Refresh] Token başarıyla yenilendi!');

    // LocalStorage'ı güncelle
    const newSession = {
      ...session,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

    return data.access_token;
  } catch (error) {
    console.error('❌ [Refresh] Kritik hata:', error);
    throw error;
  }
}

async function getAuthTokenSafely() {
  console.log('🕵️ [Token] Token aranıyor...');
  
  // 1. Önce LocalStorage'a bak
  const session = await getStoredSession();
  if (session?.access_token) {
    console.log('✅ [Token] LocalStorage üzerinden alındı.');
    return session.access_token;
  }

  // 2. Bulunamazsa SDK dene (Timeout korumalı)
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SDK Timeout')), 1000)
    );
    
    const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
    if (data?.session?.access_token) {
      console.log('✅ [Token] SDK üzerinden alındı.');
      return data.session.access_token;
    }
  } catch (e) {
    console.warn('⚠️ [Token] SDK yanıt vermedi.');
  }
  
  return null;
}

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
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [DirectFetch] HTTP Hatası:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  return data;
}

async function deleteFromSupabase(id: string, retryCount = 0): Promise<void> {
  console.log(`🔄 [Delete] İşlem başladı (Deneme: ${retryCount + 1})`);
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  let token = await getAuthTokenSafely();

  if (!token && retryCount === 0) {
    // Token yoksa, belki süresi dolmuştur, yenilemeyi dene
    try {
      token = await refreshAuthTokenManual();
    } catch (e) {
      console.warn('⚠️ [Delete] Token yenileme başarısız oldu.');
    }
  }

  const url = `${supabaseUrl}/rest/v1/blog_posts?id=eq.${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token || supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  });
  
  if (!response.ok) {
    // 401 Hatası ve ilk deneme ise -> Token yenile ve tekrar dene
    if (response.status === 401 && retryCount < 1) {
      console.warn('⚠️ [Delete] 401 Yetki Hatası. Token yenilenip tekrar denenecek...');
      try {
        await refreshAuthTokenManual();
        return deleteFromSupabase(id, retryCount + 1);
      } catch (refreshError) {
        console.error('❌ [Delete] Token yenileme başarısız, işlem iptal.', refreshError);
        throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      }
    }

    const errorText = await response.text();
    console.error('❌ [Delete] HTTP Hatası:', response.status, errorText);
    throw new Error(`Silme işlemi başarısız: ${response.status} ${errorText}`);
  }
  
  console.log('✅ [Delete] Silme işlemi başarılı');
}

// DEMO VERİLERİ
const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Çocuklarda Dil Gelişimi: 0-2 Yaş Dönemi',
    slug: 'cocuklarda-dil-gelisimi',
    excerpt: 'Bebeklik döneminde dil gelişiminin önemi ve ebeveynlerin yapabilecekleri pratik aktiviteler.',
    image_url: 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg',
    category_id: 'cat1',
    is_published: true,
    is_featured: true,
    views: 1250,
    read_time: '5 dk',
    created_at: new Date().toISOString(),
    blog_categories: { name: 'Gelişim' }
  },
  {
    id: '2',
    title: 'İki Dilli Çocuk Yetiştirmenin Püf Noktaları',
    slug: 'iki-dilli-cocuk-yetistirme',
    excerpt: 'Birden fazla dil konuşulan evlerde çocukların dil edinim süreçlerini desteklemek için öneriler.',
    image_url: 'https://images.pexels.com/photos/8363770/pexels-photo-8363770.jpeg',
    category_id: 'cat2',
    is_published: true,
    is_featured: false,
    views: 850,
    read_time: '7 dk',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    blog_categories: { name: 'Eğitim' }
  }
];

const BlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Silme işlemi için state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchPosts();
    return () => { mounted.current = false; };
  }, []);

  const fetchPosts = async () => {
    if (!mounted.current) return;
    setLoading(true);
    setIsDemoMode(false);
    
    try {
      const postsData = await fetchFromSupabase('blog_posts', 'select=*&order=created_at.desc');
      const categoriesData = await fetchFromSupabase('blog_categories', 'select=id,name');

      const categoryMap = (categoriesData || []).reduce((acc: any, cat: any) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {});

      const formattedPosts = (postsData || []).map((post: any) => ({
        ...post,
        blog_categories: {
          name: categoryMap[post.category_id] || 'Genel'
        }
      }));

      if (mounted.current) {
        setPosts(formattedPosts);
      }

    } catch (error: any) {
      console.error('❌ İŞLEM BAŞARISIZ:', error);
      if (mounted.current) {
        setPosts(MOCK_POSTS);
        setIsDemoMode(true);
        toast.warning(`Veri çekilemedi. Demo modu aktif.`);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  // Silme butonuna basıldığında sadece ID'yi set et ve modalı aç
  const handleDeleteClick = (id: string) => {
    console.log('🖱️ Silme butonu tıklandı, Modal açılıyor. ID:', id);
    setDeleteId(id);
  };

  // Modaldaki "Evet, Sil" butonuna basıldığında çalışır
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    console.log('🚀 Silme işlemi onaylandı, başlıyor...');
    setIsDeleting(true);

    if (isDemoMode) {
      setPosts(posts.filter(p => p.id !== deleteId));
      toast.success('Demo: Yazı silindi');
      setDeleteId(null);
      setIsDeleting(false);
      return;
    }

    try {
      await deleteFromSupabase(deleteId);
      
      // State'i güncelle
      setPosts(currentPosts => currentPosts.filter(post => post.id !== deleteId));
      toast.success('Yazı başarıyla silindi');
      setDeleteId(null); // Modalı kapat
      
    } catch (error: any) {
      console.error('❌ Silme hatası:', error);
      
      if (error.message.includes('Oturum süreniz doldu')) {
        toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error('Silme işlemi başarısız oldu: ' + (error.message || 'Bilinmeyen hata'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async (post: BlogPost) => {
    if (isDemoMode) {
      setPosts(posts.map(p => p.id === post.id ? { ...p, is_featured: !p.is_featured } : p));
      toast.success('Demo: Öne çıkarma durumu güncellendi');
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_featured: !post.is_featured })
        .eq('id', post.id);

      if (error) throw error;
      setPosts(posts.map(p => p.id === post.id ? { ...p, is_featured: !p.is_featured } : p));
      toast.success('Durum güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız oldu');
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Blog yazıları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Yönetimi</h1>
            {isDemoMode && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                <WifiOff className="h-3 w-3 mr-1" />
                Demo Modu
              </Badge>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Blog yazılarını yönetin, düzenleyin ve öne çıkarın
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchPosts} title="Listeyi Yenile">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/content/blog/categories')}>
            <Tag className="h-4 w-4 mr-2" />
            Kategoriler
          </Button>
          <Button onClick={() => navigate('/admin/content/blog/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yazı Ekle
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Yazı başlığı veya içerik ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full group relative">
            
            {/* Featured Badge */}
            {post.is_featured && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Öne Çıkan
                </Badge>
              </div>
            )}

            <div className="relative h-48 overflow-hidden bg-gray-100">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FileText className="h-12 w-12" />
                </div>
              )}
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {post.blog_categories?.name || 'Genel'}
                </span>
                <Badge variant={post.is_published ? 'default' : 'secondary'} className="text-xs">
                  {post.is_published ? 'Yayında' : 'Taslak'}
                </Badge>
              </div>
              <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-4 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.views}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="!flex items-center justify-center h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-50 min-w-[160px]">
                    <DropdownMenuItem onClick={() => toggleFeatured(post)} className="cursor-pointer">
                      <Star className={`h-4 w-4 mr-2 ${post.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      {post.is_featured ? 'Öne Çıkarma' : 'Öne Çıkar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/admin/content/blog/edit/${post.id}`)} className="cursor-pointer">
                      <Pencil className="h-4 w-4 mr-2" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDeleteClick(post.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Henüz yazı yok</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Blogunuza ilk yazınızı ekleyerek başlayın.
          </p>
          <Button onClick={() => navigate('/admin/content/blog/new')}>
            <Plus className="h-4 w-4 mr-2" />
            İlk Yazıyı Ekle
          </Button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yazıyı Sil</h3>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Bu blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve yazı kalıcı olarak silinecektir.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteId(null)} 
                disabled={isDeleting}
              >
                İptal
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Evet, Sil'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
