import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Home, Users, Mail, Laptop, MessageSquareQuote, Globe } from 'lucide-react';

const pages = [
  {
    key: 'global',
    title: 'Genel Ayarlar',
    description: 'Duyuru bandı ve site genelindeki metinleri düzenleyin',
    icon: Globe,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    key: 'home',
    title: 'Anasayfa',
    description: 'Ana sayfa içeriğini düzenleyin',
    icon: Home,
    color: 'from-blue-500 to-blue-600',
  },
  {
    key: 'about',
    title: 'Hakkımızda',
    description: 'Hakkımızda sayfası içeriğini düzenleyin',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
  },
  {
    key: 'contact',
    title: 'İletişim',
    description: 'İletişim sayfası içeriğini düzenleyin',
    icon: Mail,
    color: 'from-green-500 to-green-600',
  },
  {
    key: 'learning-platform',
    title: 'Öğrenme Platformu',
    description: 'Öğrenme platformu sayfası içeriğini düzenleyin',
    icon: Laptop,
    color: 'from-orange-500 to-orange-600',
  },
  {
    key: 'testimonials',
    title: 'Velilerimiz Ne Diyor?',
    description: 'Veli yorumlarını yönetin',
    icon: MessageSquareQuote,
    color: 'from-pink-500 to-pink-600',
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
          Statik sayfa içeriklerini, duyuruları ve veli yorumlarını düzenleyin
        </p>
      </div>

      {/* Pages Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Card
              key={page.key}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/admin/content/${page.key}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                      <CardDescription className="mt-1">
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

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                İçerik Düzenleme Hakkında
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 mt-2">
                Bu sayfadan statik sayfa içeriklerini ve veli yorumlarını düzenleyebilirsiniz. 
                Değişiklikler anında yayına alınır ve tüm kullanıcılar tarafından görülebilir.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ContentManagement;
