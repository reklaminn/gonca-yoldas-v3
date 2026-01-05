import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Tag, Search, TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string; // Changed from featured_image
  created_at: string; // Using created_at as published_at might not exist in schema based on migration
  read_time: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    full_name: string;
    avatar_url: string;
  };
  views: number;
}

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Data States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    setLoading(true);
    setError(null);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };

    try {
      console.log('📡 Blog verileri çekiliyor (Direct REST)...');

      // 1. Kategorileri Çek
      const catResponse = await fetch(`${supabaseUrl}/rest/v1/blog_categories?select=*`, { headers });
      if (!catResponse.ok) throw new Error('Kategoriler yüklenemedi');
      const categoriesData = await catResponse.json();

      // 2. Yazıları Çek
      // DÜZELTME: featured_image -> image_url
      // DÜZELTME: published_at -> created_at (Migration dosyasında published_at yoktu, created_at vardı)
      const query = `select=id,title,slug,excerpt,image_url,created_at,views,category_id,blog_categories(name,slug)&is_published=eq.true&order=created_at.desc`;
      
      const postsResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?${query}`, { headers });
      
      if (!postsResponse.ok) {
        const errText = await postsResponse.text();
        console.error('Blog fetch error:', errText);
        // Hata detayını kullanıcıya göstermek için parse etmeye çalışalım
        try {
            const errJson = JSON.parse(errText);
            throw new Error(`Hata: ${errJson.message || postsResponse.status}`);
        } catch {
            throw new Error(`Yazılar yüklenemedi: ${postsResponse.status}`);
        }
      }
      
      const postsData = await postsResponse.json();
      console.log(`✅ ${postsData.length} yazı çekildi.`);

      // Veriyi işle
      const formattedPosts: BlogPost[] = postsData.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        image_url: post.image_url || 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        created_at: post.created_at,
        read_time: '5 dk',
        // İlişkisel veri kontrolü
        category: post.blog_categories ? {
          name: post.blog_categories.name,
          slug: post.blog_categories.slug
        } : { name: 'Genel', slug: 'genel' },
        author: { full_name: 'Gonca Yoldaş', avatar_url: '' }, 
        views: post.views || 0
      }));

      // Kategori sayılarını hesapla
      const categoriesWithCounts = categoriesData.map((cat: any) => ({
        ...cat,
        count: formattedPosts.filter(p => p.category.slug === cat.slug).length
      }));

      setCategories(categoriesWithCounts);
      setPosts(formattedPosts);

    } catch (err: any) {
      console.error('Blog verileri çekilemedi:', err);
      setError(err.message || 'Blog yazıları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Featured Post (En son yayınlanan)
  const featuredPost = posts.length > 0 ? posts[0] : null;
  
  // Diğer yazılar (Featured hariç)
  const otherPosts = posts.length > 0 ? posts.slice(1) : [];

  // Popüler Yazılar (Görüntülenmeye göre)
  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 3);

  // Filtreleme
  const filteredPosts = otherPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           post.category.slug === selectedCategory;
                           
    return matchesSearch && matchesCategory;
  });

  // Animasyon varyantları
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-[var(--fg-muted)]">Blog yazıları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Blog</h1>
            <p className="text-xl text-blue-100 mb-8">
              Çocuk gelişimi, dil öğrenimi ve ebeveynlik hakkında uzman yazıları
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            {/* Categories */}
            <Card className="mb-6 border-[var(--border)] bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
                  <Tag className="h-5 w-5 text-[var(--color-primary)]" />
                  Kategoriler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'hover:bg-[var(--hover-overlay)] text-[var(--fg)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Tümü</span>
                    <span className="text-sm opacity-75">({posts.length})</span>
                  </div>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'hover:bg-[var(--hover-overlay)] text-[var(--fg)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm opacity-75">({category.count})</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
                  <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
                  Popüler Yazılar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div key={post.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors text-[var(--fg)] line-clamp-2"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-[var(--fg-muted)] mt-1">{post.views} görüntülenme</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
                <Button variant="outline" size="sm" onClick={fetchBlogData} className="bg-white text-red-600 border-red-200 hover:bg-red-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </Button>
              </div>
            )}

            {/* Featured Post */}
            {featuredPost && !searchQuery && selectedCategory === 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="mb-8 overflow-hidden hover:shadow-xl transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="h-64 md:h-auto relative">
                      <img
                        src={featuredPost.image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <div className="inline-block bg-[var(--bg-elev)] text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit">
                        Öne Çıkan
                      </div>
                      <h2 className="text-3xl font-bold mb-4 text-[var(--fg)]">
                        <Link to={`/blog/${featuredPost.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                          {featuredPost.title}
                        </Link>
                      </h2>
                      <p className="text-[var(--fg-muted)] mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)] mb-6">
                        <div className="flex items-center gap-2">
                          {featuredPost.author.avatar_url ? (
                            <img
                              src={featuredPost.author.avatar_url}
                              alt={featuredPost.author.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-bold">{featuredPost.author.full_name?.charAt(0)}</span>
                            </div>
                          )}
                          <span>{featuredPost.author.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(featuredPost.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                        </div>
                      </div>

                      <Button asChild>
                        <Link to={`/blog/${featuredPost.slug}`}>
                          Devamını Oku
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Posts Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-[var(--fg)] mb-2">
                {searchQuery ? 'Arama Sonuçları' : 'Son Yazılar'}
              </h2>
              <p className="text-[var(--fg-muted)]">{filteredPosts.length} yazı bulundu</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)] h-full flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <div className="text-sm text-[var(--color-primary)] font-semibold mb-2">
                        {post.category.name}
                      </div>
                      <CardTitle className="text-xl text-[var(--fg)] line-clamp-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-[var(--fg-muted)] line-clamp-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)] mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(post.created_at), 'd MMM yyyy', { locale: tr })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.read_time}</span>
                        </div>
                      </div>
                      <Button variant="ghost" className="p-0 text-[var(--color-primary)] hover:bg-transparent hover:text-[var(--color-primary)]/80" asChild>
                        <Link to={`/blog/${post.slug}`}>
                          Devamını Oku →
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredPosts.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center py-12 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]"
              >
                <p className="text-[var(--fg-muted)] text-lg">
                  {searchQuery 
                    ? `"${searchQuery}" araması için sonuç bulunamadı.` 
                    : 'Bu kategoride henüz yazı bulunmuyor.'}
                </p>
                {searchQuery && (
                  <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                    Aramayı Temizle
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
