import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Search, 
  Plus,
  Edit,
  Eye,
  Clock,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Play,
  Download
} from 'lucide-react';

const AdminLessons: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const lessons = [
    {
      id: 1,
      title: 'Alfabe Tanıtımı',
      titleEn: 'Alphabet Introduction',
      program: 'Baby English (0-2 Yaş)',
      programId: 1,
      type: 'video',
      duration: '15 dakika',
      order: 1,
      status: 'published',
      views: 245,
      completionRate: 87,
      createdAt: '1 Ocak 2025'
    },
    {
      id: 2,
      title: 'Renkler ve Şekiller',
      titleEn: 'Colors and Shapes',
      program: 'Baby English (0-2 Yaş)',
      programId: 1,
      type: 'interactive',
      duration: '20 dakika',
      order: 2,
      status: 'published',
      views: 198,
      completionRate: 92,
      createdAt: '2 Ocak 2025'
    },
    {
      id: 3,
      title: 'Sayılar 1-10',
      titleEn: 'Numbers 1-10',
      program: 'Playful Learning (2-5 Yaş)',
      programId: 2,
      type: 'video',
      duration: '18 dakika',
      order: 1,
      status: 'published',
      views: 312,
      completionRate: 85,
      createdAt: '3 Ocak 2025'
    },
    {
      id: 4,
      title: 'Hayvan Sesleri',
      titleEn: 'Animal Sounds',
      program: 'Playful Learning (2-5 Yaş)',
      programId: 2,
      type: 'interactive',
      duration: '25 dakika',
      order: 2,
      status: 'draft',
      views: 0,
      completionRate: 0,
      createdAt: '5 Ocak 2025'
    },
    {
      id: 5,
      title: 'Temel Gramer',
      titleEn: 'Basic Grammar',
      program: 'Smart Kids (5-10 Yaş)',
      programId: 3,
      type: 'document',
      duration: '30 dakika',
      order: 1,
      status: 'published',
      views: 156,
      completionRate: 78,
      createdAt: '4 Ocak 2025'
    },
  ];

  const programs = [
    { id: 1, name: 'Baby English (0-2 Yaş)' },
    { id: 2, name: 'Playful Learning (2-5 Yaş)' },
    { id: 3, name: 'Smart Kids (5-10 Yaş)' },
  ];

  const stats = [
    {
      label: 'Toplam Ders',
      value: lessons.length,
      icon: BookOpen,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Yayında',
      value: lessons.filter(l => l.status === 'published').length,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
    },
    {
      label: 'Toplam Görüntülenme',
      value: lessons.reduce((sum, l) => sum + l.views, 0),
      icon: Eye,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Ort. Tamamlanma',
      value: `${Math.round(lessons.reduce((sum, l) => sum + l.completionRate, 0) / lessons.length)}%`,
      icon: CheckCircle,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400'
    },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      published: { label: 'Yayında', variant: 'default' as const, icon: CheckCircle },
      draft: { label: 'Taslak', variant: 'secondary' as const, icon: AlertCircle },
    };
    const statusConfig = config[status as keyof typeof config];
    const Icon = statusConfig.icon;
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      video: { label: 'Video', icon: Video, color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900' },
      interactive: { label: 'İnteraktif', icon: Play, color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900' },
      document: { label: 'Doküman', icon: FileText, color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' },
    };
    const typeConfig = config[type as keyof typeof config];
    const Icon = typeConfig.icon;
    return (
      <Badge variant="outline" className={`flex items-center gap-1 w-fit ${typeConfig.color}`}>
        <Icon className="h-3 w-3" />
        {typeConfig.label}
      </Badge>
    );
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        lesson.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = selectedProgram === 'all' || lesson.programId.toString() === selectedProgram;
    const matchesType = selectedType === 'all' || lesson.type === selectedType;
    return matchesSearch && matchesProgram && matchesType;
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ders Yönetimi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tüm dersleri görüntüleyin ve yönetin</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ders ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-700"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">Tüm Programlar</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedType('all')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                Tümü
              </Button>
              <Button
                variant={selectedType === 'video' ? 'default' : 'outline'}
                onClick={() => setSelectedType('video')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                Video
              </Button>
              <Button
                variant={selectedType === 'interactive' ? 'default' : 'outline'}
                onClick={() => setSelectedType('interactive')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                İnteraktif
              </Button>
              <Button
                variant={selectedType === 'document' ? 'default' : 'outline'}
                onClick={() => setSelectedType('document')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                Doküman
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Ders Listesi ({filteredLessons.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Sistemdeki tüm dersler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {lesson.order}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                    {getTypeBadge(lesson.type)}
                    {getStatusBadge(lesson.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{lesson.titleEn}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {lesson.program}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {lesson.views} görüntülenme
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tamamlanma</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.completionRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{lesson.createdAt}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredLessons.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Ders bulunamadı</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLessons;
