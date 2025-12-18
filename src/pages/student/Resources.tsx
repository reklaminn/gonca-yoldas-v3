import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Video, 
  Headphones, 
  Download,
  Search,
  Filter,
  BookOpen
} from 'lucide-react';

export default function Resources() {
  const resources = [
    {
      id: 1,
      title: 'Renkler ve Şekiller - Çalışma Kağıdı',
      type: 'pdf',
      program: 'Baby English',
      size: '2.4 MB',
      downloads: 45,
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20'
    },
    {
      id: 2,
      title: 'Hayvanlar - Video Ders',
      type: 'video',
      program: 'Playful Learning',
      size: '125 MB',
      downloads: 32,
      icon: Video,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 3,
      title: 'Sayılar - Ses Kaydı',
      type: 'audio',
      program: 'Baby English',
      size: '8.5 MB',
      downloads: 28,
      icon: Headphones,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 4,
      title: 'Mevsimler - Aktivite Kitabı',
      type: 'pdf',
      program: 'Playful Learning',
      size: '5.2 MB',
      downloads: 51,
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20'
    },
  ];

  const categories = [
    { label: 'Tümü', count: resources.length },
    { label: 'PDF', count: resources.filter(r => r.type === 'pdf').length },
    { label: 'Video', count: resources.filter(r => r.type === 'video').length },
    { label: 'Ses', count: resources.filter(r => r.type === 'audio').length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Kaynaklar</h1>
        <p className="text-[var(--fg-muted)] mt-2">Ders materyalleri ve ek kaynaklar</p>
      </div>

      {/* Search and Filter */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
              <Input
                placeholder="Kaynak ara..."
                className="pl-10 bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrele
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category, index) => (
              <Badge
                key={index}
                variant={index === 0 ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                {category.label} ({category.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Card key={resource.id} className="border-[var(--border)] bg-[var(--bg-card)] hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${resource.bgColor}`}>
                    <Icon className={`h-6 w-6 ${resource.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--fg)] mb-1">{resource.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)] mb-3">
                      <BookOpen className="h-4 w-4" />
                      <span>{resource.program}</span>
                      <span>•</span>
                      <span>{resource.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--fg-muted)]">
                        {resource.downloads} indirme
                      </span>
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        İndir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State (if no resources) */}
      {resources.length === 0 && (
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-[var(--fg-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Henüz kaynak bulunmuyor</h3>
            <p className="text-[var(--fg-muted)]">
              Kayıtlı olduğunuz programlar için kaynaklar burada görünecektir
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
