import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Home, Users, Mail, Laptop, MessageSquareQuote, Globe, BookOpen, Shield, Scale, Cookie, ScrollText } from 'lucide-react';

const pages = [
  {
    key: 'blog',
    title: 'Blog Yönetimi',
    description: 'Blog yazılarını ekleyin, düzenleyin ve öne çıkarın',
    icon: BookOpen,
    color: 'from-rose-500 to-rose-600',
    path: '/admin/content/blog'
  },
  {
    key: 'global',
    title: 'Genel Ayarlar',
    description: 'Duyuru bandı ve site genelindeki metinleri düzenleyin',
    icon: Globe,
    color: 'from-indigo-500 to-indigo-600',
    path: '/admin/content/global'
  },
  {
    key: 'home',
    title: 'Anasayfa',
    description: 'Ana sayfa içeriğini düzenleyin',
    icon: Home,
    color: 'from-blue-500 to-blue-600',
    path: '/admin/content/home'
  },
  {
    key: 'about',
    title: 'Hakkımızda',
    description: 'Hakkımızda sayfası içeriğini düzenleyin',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    path: '/admin/content/about'
  },
  {
    key: 'contact',
    title: 'İletişim',
    description: 'İletişim sayfası içeriğini düzenleyin',
    icon: Mail,
    color: 'from-green-500 to-green-600',
    path: '/admin/content/contact'
  },
  {
    key: 'learning-platform',
    title: 'Öğrenme Platformu',
    description: 'Öğrenme platformu sayfası içeriğini düzenleyin',
    icon: Laptop,
    color: 'from-orange-500 to-orange-600',
    path: '/admin/content/learning-platform'
  },
  {
    key: 'testimonials',
    title: 'Velilerimiz Ne Diyor?',
    description: 'Veli yorumlarını yönetin',
    icon: MessageSquareQuote,
    color: 'from-pink-500 to-pink-600',
    path: '/admin/content/testimonials'
  },
  // Legal Pages
  {
    key: 'legal-privacy',
    title: 'Gizlilik Politikası',
    description: 'Gizlilik politikası metnini düzenleyin',
    icon: Shield,
    color: 'from-slate-500 to-slate-600',
    path: '/admin/content/legal-privacy'
  },
  {
    key: 'legal-terms',
    title: 'Kullanım Koşulları',
    description: 'Kullanım koşulları metnini düzenleyin',
    icon: FileText,
    color: 'from-slate-500 to-slate-600',
    path: '/admin/content/legal-terms'
  },
  {
    key: 'legal-cookies',
    title: 'Çerez Politikası',
    description: 'Çerez politikası metnini düzenleyin',
    icon: Cookie,
    color: 'from-slate-500 to-slate-600',
    path: '/admin/content/legal-cookies'
  },
  {
    key: 'legal-kvkk',
    title: 'KVKK Aydınlatma',
    description: 'KVKK aydınlatma metnini düzenleyin',
    icon: Scale,
    color: 'from-slate-500 to-slate-600',
    path: '/admin/content/legal-kvkk'
  },
  {
    key: 'legal-distance-sales',
    title: 'Mesafeli Satış Söz.',
    description: 'Mesafeli satış sözleşmesi metnini düzenleyin',
    icon: ScrollText,
    color: 'from-slate-500 to-slate-600',
    path: '/admin/content/legal-distance-sales'
  },
];

const ContentManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          İçerik Yönetimi
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Blog yazılarını, statik sayfa içeriklerini ve yasal metinleri düzenleyin
        </p>
      </div>

      {/* Pages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Card
              key={page.key}
              className="hover:shadow-lg transition-shadow cursor-pointer group border-gray-200 dark:border-gray-800"
              onClick={() => navigate(page.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {page.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ContentManagement;
