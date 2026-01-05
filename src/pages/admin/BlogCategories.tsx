import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Loader2, WifiOff, Pencil, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// --- DOĞRUDAN FETCH YARDIMCI FONKSİYONLARI ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getHeaders = (token: string | null) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation' // İşlem sonrası veriyi geri döndür
});

// OKUMA (GET)
async function fetchCategoriesDirect() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_categories?select=*&order=name.asc`, {
    method: 'GET',
    headers: getHeaders(null)
  });
  if (!response.ok) throw new Error(`GET Error: ${response.status}`);
  return await response.json();
}

// EKLEME (POST)
async function createCategoryDirect(category: { name: string; slug: string }, token: string) {
  console.log('🚀 [API] Kategori ekleniyor:', category);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_categories`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(category)
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error('❌ [API] Ekleme Hatası:', text);
    throw new Error(`POST Error: ${response.status} - ${text}`);
  }

  // Yanıtı güvenli bir şekilde parse et
  try {
    const data = await response.json();
    console.log('✅ [API] Ekleme Başarılı, Dönen Veri:', data);
    return data;
  } catch (e) {
    console.warn('⚠️ [API] JSON parse edilemedi (boş yanıt olabilir):', e);
    return []; // Boş dizi dön
  }
}

// GÜNCELLEME (PATCH)
async function updateCategoryDirect(id: string, updates: { name: string; slug: string }, token: string) {
  console.log('🚀 [API] Kategori güncelleniyor:', id, updates);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_categories?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PATCH Error: ${response.status} - ${text}`);
  }
  return await response.json();
}

// SİLME (DELETE)
async function deleteCategoryDirect(id: string, token: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_categories?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DELETE Error: ${response.status} - ${text}`);
  }
  return true;
}
// -------------------------------------------

const BlogCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form State
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isDemoMode, setIsDemoMode] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadCategories();
    return () => { mounted.current = false; };
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setIsDemoMode(false);
    
    try {
      const data = await fetchCategoriesDirect();
      if (mounted.current) {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('❌ Kategori yükleme hatası:', error);
      if (mounted.current) {
        // Demo moduna geçme, hatayı göster
        toast.error('Kategoriler yüklenemedi. Lütfen sayfayı yenileyin.');
        setCategories([]);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

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

  const getSessionToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Oturum süresi dolmuş veya giriş yapılmamış.');
    return session.access_token;
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setActionLoading(true);

    const slug = generateSlug(categoryName);

    try {
      const token = await getSessionToken();

      if (editingId) {
        // GÜNCELLEME
        const result = await updateCategoryDirect(editingId, { name: categoryName, slug }, token);
        
        if (Array.isArray(result) && result.length > 0) {
          const updated = result[0];
          setCategories(prev => prev.map(c => c.id === editingId ? updated : c));
          toast.success('Kategori güncellendi');
        } else {
          // Veri dönmediyse listeyi yenile
          await loadCategories();
          toast.success('Kategori güncellendi');
        }
      } else {
        // EKLEME
        const result = await createCategoryDirect({ name: categoryName, slug }, token);
        
        if (Array.isArray(result) && result.length > 0) {
          const created = result[0];
          // Güvenli ekleme: created undefined değilse ekle
          if (created) {
            setCategories(prev => [...prev, created]);
            toast.success('Kategori eklendi');
          } else {
            await loadCategories();
            toast.success('Kategori eklendi (Liste yenilendi)');
          }
        } else {
          // API başarılı ama veri dönmedi (örn: 201 Created ama body boş)
          console.log('⚠️ Veri dönmedi, liste yenileniyor...');
          await loadCategories();
          toast.success('Kategori eklendi');
        }
      }
      resetForm();
    } catch (error: any) {
      console.error('İşlem hatası:', error);
      toast.error(`İşlem başarısız: ${error.message}`);
    } finally {
      // Her durumda loading'i kapat
      setActionLoading(false);
    }
  };

  const handleEditClick = (category: any) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const token = await getSessionToken();
      await deleteCategoryDirect(id, token);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Kategori silindi');
      
      if (editingId === id) resetForm();
      
    } catch (error: any) {
      console.error('Silme hatası:', error);
      toast.error(`Silinemedi: ${error.message}`);
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setEditingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/content/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kategori Yönetimi
            </h1>
          </div>
        </div>
      </div>

      {/* EKLEME / DÜZENLEME FORMU */}
      <Card className={editingId ? "border-blue-500 ring-1 ring-blue-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</span>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 text-gray-500">
                <X className="h-4 w-4 mr-1" /> İptal
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Kategori adı..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={actionLoading}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={actionLoading || !categoryName.trim()}
              className={editingId ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <>
                  <Save className="h-4 w-4 mr-2" /> Güncelle
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Ekle
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LİSTE */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Kategoriler</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori Adı</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className={editingId === category.id ? "bg-blue-50" : ""}>
                    <TableCell className="font-medium">
                      {category.name}
                      {editingId === category.id && <Badge className="ml-2 bg-blue-100 text-blue-700">Düzenleniyor</Badge>}
                    </TableCell>
                    <TableCell className="text-gray-500">{category.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditClick(category)}
                          disabled={actionLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(category.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                      Henüz kategori bulunmuyor.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCategories;
