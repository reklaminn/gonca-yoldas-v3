import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { 
      FileText, 
      Search, 
      Plus,
      Edit,
      Trash2,
      Eye,
      Calendar,
      User,
      Tag,
      TrendingUp,
      CheckCircle,
      Clock,
      AlertCircle,
      MoreVertical,
      Image as ImageIcon,
      Copy,
      Archive
    } from 'lucide-react';

    const BlogManagement: React.FC = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedStatus, setSelectedStatus] = useState('all');
      const [selectedCategory, setSelectedCategory] = useState('all');

      const posts = [
        {
          id: 1,
          title: 'Çocuklarda Dil Gelişimi: 0-2 Yaş Dönemi',
          titleEn: 'Language Development in Children: 0-2 Years',
          slug: 'cocuklarda-dil-gelisimi-0-2-yas',
          excerpt: 'Bebeklik döneminde dil gelişiminin önemi ve ebeveynlerin yapabilecekleri...',
          category: 'Eğitim',
          author: 'Gonca Yoldaş',
          status: 'published',
          publishDate: '15 Ocak 2025',
          views: 2456,
          readTime: '5 dakika',
          featuredImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
          tags: ['Dil Gelişimi', 'Bebek', 'Eğitim'],
          lastUpdated: '2 saat önce'
        },
        {
          id: 2,
          title: 'İki Dilli Çocuk Yetiştirmenin Avantajları',
          titleEn: 'Benefits of Raising Bilingual Children',
          slug: 'iki-dilli-cocuk-yetistirme',
          excerpt: 'İki dilli büyüyen çocukların bilişsel ve sosyal gelişimleri üzerine...',
          category: 'Araştırma',
          author: 'Gonca Yoldaş',
          status: 'published',
          publishDate: '12 Ocak 2025',
          views: 3421,
          readTime: '7 dakika',
          featuredImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
          tags: ['İki Dil', 'Araştırma', 'Gelişim'],
          lastUpdated: '1 gün önce'
        },
        {
          id: 3,
          title: 'Oyun Tabanlı Öğrenme Metodları',
          titleEn: 'Play-Based Learning Methods',
          slug: 'oyun-tabanli-ogrenme',
          excerpt: 'Çocukların oyun oynayarak nasıl daha etkili öğrendiklerini keşfedin...',
          category: 'Metodoloji',
          author: 'Gonca Yoldaş',
          status: 'draft',
          publishDate: null,
          views: 0,
          readTime: '6 dakika',
          featuredImage: null,
          tags: ['Oyun', 'Öğrenme', 'Metodoloji'],
          lastUpdated: '3 saat önce'
        },
        {
          id: 4,
          title: 'Teknoloji ve Erken Çocukluk Eğitimi',
          titleEn: 'Technology and Early Childhood Education',
          slug: 'teknoloji-erken-cocukluk',
          excerpt: 'Dijital araçların erken çocukluk eğitimindeki rolü ve doğru kullanımı...',
          category: 'Teknoloji',
          author: 'Gonca Yoldaş',
          status: 'scheduled',
          publishDate: '20 Ocak 2025',
          views: 0,
          readTime: '8 dakika',
          featuredImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
          tags: ['Teknoloji', 'Eğitim', 'Dijital'],
          lastUpdated: '5 saat önce'
        },
      ];

      const categories = [
        { id: 1, name: 'Eğitim', count: 12 },
        { id: 2, name: 'Araştırma', count: 8 },
        { id: 3, name: 'Metodoloji', count: 6 },
        { id: 4, name: 'Teknoloji', count: 4 },
        { id: 5, name: 'Gelişim', count: 10 },
      ];

      const stats = [
        {
          label: 'Toplam Yazı',
          value: posts.length,
          icon: FileText,
          color: 'bg-blue-100 text-blue-600',
          trend: '+3',
          trendUp: true
        },
        {
          label: 'Yayınlanan',
          value: posts.filter(p => p.status === 'published').length,
          icon: CheckCircle,
          color: 'bg-green-100 text-green-600',
          trend: '+2',
          trendUp: true
        },
        {
          label: 'Taslak',
          value: posts.filter(p => p.status === 'draft').length,
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-600',
          trend: '0',
          trendUp: false
        },
        {
          label: 'Toplam Görüntülenme',
          value: posts.reduce((sum, p) => sum + p.views, 0).toLocaleString(),
          icon: Eye,
          color: 'bg-purple-100 text-purple-600',
          trend: '+18%',
          trendUp: true
        },
      ];

      const getStatusBadge = (status: string) => {
        const config = {
          published: { label: 'Yayında', variant: 'default' as const, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          draft: { label: 'Taslak', variant: 'secondary' as const, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
          scheduled: { label: 'Zamanlanmış', variant: 'outline' as const, icon: Calendar, color: 'bg-blue-100 text-blue-700' },
          archived: { label: 'Arşiv', variant: 'outline' as const, icon: Archive, color: 'bg-gray-100 text-gray-700' },
        };
        const statusConfig = config[status as keyof typeof config];
        const Icon = statusConfig.icon;
        return (
          <Badge variant={statusConfig.variant} className={`flex items-center gap-1 w-fit ${statusConfig.color}`}>
            <Icon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        );
      };

      const filteredPosts = posts.filter(post => {
        const matchesSearch = 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesStatus && matchesCategory;
      });

      return (
        <div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blog Yönetimi</h1>
                <p className="text-gray-600 mt-2">Blog yazılarını oluşturun ve yönetin</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Yazı
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className={`h-4 w-4 ${stat.trendUp ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={stat.trendUp ? 'text-green-600' : 'text-gray-600'}>{stat.trend}</span>
                      <span className="text-gray-500">bu ay</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            {/* Filters */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Yazı ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedStatus === 'all' ? 'default' : 'outline'}
                        onClick={() => setSelectedStatus('all')}
                        size="sm"
                      >
                        Tümü
                      </Button>
                      <Button
                        variant={selectedStatus === 'published' ? 'default' : 'outline'}
                        onClick={() => setSelectedStatus('published')}
                        size="sm"
                      >
                        Yayında
                      </Button>
                      <Button
                        variant={selectedStatus === 'draft' ? 'default' : 'outline'}
                        onClick={() => setSelectedStatus('draft')}
                        size="sm"
                      >
                        Taslak
                      </Button>
                      <Button
                        variant={selectedStatus === 'scheduled' ? 'default' : 'outline'}
                        onClick={() => setSelectedStatus('scheduled')}
                        size="sm"
                      >
                        Zamanlanmış
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kategoriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tümü</span>
                      <span className="text-xs text-gray-500">{posts.length}</span>
                    </div>
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts List */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Yazıları ({filteredPosts.length})</CardTitle>
              <CardDescription>Tüm blog içerikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{post.titleEn}</p>
                        </div>
                        {getStatusBadge(post.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                        {post.status === 'published' && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views.toLocaleString()} görüntülenme
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {post.publishDate ? (
                            <span>Yayın: {post.publishDate}</span>
                          ) : (
                            <span>Son güncelleme: {post.lastUpdated}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Önizle
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Blog yazısı bulunamadı</p>
                    <p className="text-gray-500 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };

    export default BlogManagement;
