import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Tag, Search, TrendingUp } from 'lucide-react';

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tümü', count: 24 },
    { id: 'education', label: 'Eğitim', count: 12 },
    { id: 'development', label: 'Gelişim', count: 8 },
    { id: 'parenting', label: 'Ebeveynlik', count: 6 },
    { id: 'tips', label: 'İpuçları', count: 5 },
  ];

  const featuredPost = {
    id: 1,
    title: 'Çocuklara İngilizce Öğretmenin 5 Altın Kuralı',
    excerpt: 'Erken yaşta dil öğreniminin önemi ve etkili yöntemler hakkında kapsamlı rehber. Bilimsel araştırmalarla desteklenen pratik öneriler.',
    image: 'https://images.pexels.com/photos/8535214/pexels-photo-8535214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Eğitim',
    author: {
      name: 'Gonca Yoldaş',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    date: '15 Ocak 2025',
    readTime: '8 dakika',
    slug: 'cocuklara-ingilizce-ogretmenin-5-altin-kurali',
  };

  const posts = [
    {
      id: 2,
      title: 'Oyun Temelli Öğrenme Nedir?',
      excerpt: 'Çocukların oyun oynayarak nasıl daha iyi öğrendiğini keşfedin...',
      image: 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Eğitim',
      author: {
        name: 'Gonca Yoldaş',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      date: '10 Ocak 2025',
      readTime: '5 dakika',
      slug: 'oyun-temelli-ogrenme-nedir',
    },
    {
      id: 3,
      title: 'İki Dilli Çocuk Yetiştirmenin Avantajları',
      excerpt: 'Bilimsel araştırmalar iki dilli çocukların avantajlarını ortaya koyuyor...',
      image: 'https://images.pexels.com/photos/8363104/pexels-photo-8363104.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Gelişim',
      author: {
        name: 'Gonca Yoldaş',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      date: '5 Ocak 2025',
      readTime: '6 dakika',
      slug: 'iki-dilli-cocuk-yetistirmenin-avantajlari',
    },
    {
      id: 4,
      title: '0-2 Yaş Arası Bebeklerde Dil Gelişimi',
      excerpt: 'Bebeklik döneminde dil gelişimini desteklemenin yolları...',
      image: 'https://images.pexels.com/photos/3662632/pexels-photo-3662632.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Gelişim',
      author: {
        name: 'Gonca Yoldaş',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      date: '28 Aralık 2024',
      readTime: '7 dakika',
      slug: '0-2-yas-arasi-bebeklerde-dil-gelisimi',
    },
    {
      id: 5,
      title: 'Evde İngilizce Pratiği İçin 10 Aktivite',
      excerpt: 'Çocuğunuzla evde yapabileceğiniz eğlenceli İngilizce aktiviteleri...',
      image: 'https://images.pexels.com/photos/8535227/pexels-photo-8535227.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'İpuçları',
      author: {
        name: 'Gonca Yoldaş',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      date: '20 Aralık 2024',
      readTime: '4 dakika',
      slug: 'evde-ingilizce-pratigi-icin-10-aktivite',
    },
    {
      id: 6,
      title: 'Çocuklarda Motivasyonu Artırmanın Yolları',
      excerpt: 'Öğrenme sürecinde motivasyonu yüksek tutmak için pratik öneriler...',
      image: 'https://images.pexels.com/photos/8535209/pexels-photo-8535209.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Ebeveynlik',
      author: {
        name: 'Gonca Yoldaş',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      date: '15 Aralık 2024',
      readTime: '5 dakika',
      slug: 'cocuklarda-motivasyonu-artirmanin-yollari',
    },
  ];

  const popularPosts = [
    {
      id: 1,
      title: 'Çocuklara İngilizce Öğretmenin 5 Altın Kuralı',
      views: 1250,
    },
    {
      id: 2,
      title: 'İki Dilli Çocuk Yetiştirmenin Avantajları',
      views: 980,
    },
    {
      id: 3,
      title: 'Oyun Temelli Öğrenme Nedir?',
      views: 875,
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.category.toLowerCase() === categories.find(c => c.id === selectedCategory)?.label.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Animasyon varyantları
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
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
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'hover:bg-[var(--hover-overlay)] text-[var(--fg)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.label}</span>
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
                        to={`/blog/${post.id}`}
                        className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors text-[var(--fg)]"
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
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="mb-8 overflow-hidden hover:shadow-xl transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                <div className="grid md:grid-cols-2 gap-0">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="p-8 flex flex-col justify-center">
                    <div className="inline-block bg-[var(--bg-elev)] text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit">
                      Öne Çıkan
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-[var(--fg)]">
                      <Link to={`/blog/${featuredPost.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                        {featuredPost.title}
                      </Link>
                    </h2>
                    <p className="text-[var(--fg-muted)] mb-6">{featuredPost.excerpt}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)] mb-6">
                      <div className="flex items-center gap-2">
                        <img
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{featuredPost.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{featuredPost.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
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

            {/* Posts Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-[var(--fg)] mb-2">Tüm Yazılar</h2>
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
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader>
                      <div className="text-sm text-[var(--color-primary)] font-semibold mb-2">
                        {post.category}
                      </div>
                      <CardTitle className="text-xl text-[var(--fg)]">
                        <Link to={`/blog/${post.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-[var(--fg-muted)]">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)] mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <Button variant="ghost" className="p-0 text-[var(--color-primary)]" asChild>
                        <Link to={`/blog/${post.slug}`}>
                          Devamını Oku →
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center py-12"
              >
                <p className="text-[var(--fg-muted)] text-lg">
                  Aradığınız kriterlere uygun yazı bulunamadı.
                </p>
              </motion.div>
            )}

            {/* Pagination */}
            {filteredPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex justify-center gap-2 mt-12"
              >
                <Button variant="outline" disabled className="border-[var(--border)] text-[var(--fg)]">Önceki</Button>
                <Button variant="default">1</Button>
                <Button variant="outline" className="border-[var(--border)] text-[var(--fg)]">2</Button>
                <Button variant="outline" className="border-[var(--border)] text-[var(--fg)]">3</Button>
                <Button variant="outline" className="border-[var(--border)] text-[var(--fg)]">Sonraki</Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
