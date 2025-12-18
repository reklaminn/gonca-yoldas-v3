import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { 
      GraduationCap, 
      Search, 
      Plus,
      Edit,
      Trash2,
      Eye,
      Clock,
      Video,
      FileText,
      Image,
      CheckCircle,
      XCircle,
      AlertCircle,
      MoreVertical,
      Play,
      BookOpen,
      ArrowUpDown
    } from 'lucide-react';

    const LessonsManagement: React.FC = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedProgram, setSelectedProgram] = useState('all');
      const [selectedStatus, setSelectedStatus] = useState('all');

      const lessons = [
        {
          id: 1,
          title: 'Merhaba ve Tanışma',
          titleEn: 'Hello and Introduction',
          program: 'Baby English (0-2 Yaş)',
          programId: 1,
          order: 1,
          duration: '15 dakika',
          type: 'video',
          status: 'published',
          views: 1234,
          completionRate: 87,
          hasVideo: true,
          hasAudio: true,
          hasDocument: true,
          lastUpdated: '2 saat önce',
          createdAt: '1 Eylül 2024'
        },
        {
          id: 2,
          title: 'Renkler ve Şekiller',
          titleEn: 'Colors and Shapes',
          program: 'Baby English (0-2 Yaş)',
          programId: 1,
          order: 2,
          duration: '20 dakika',
          type: 'interactive',
          status: 'published',
          views: 1156,
          completionRate: 92,
          hasVideo: true,
          hasAudio: true,
          hasDocument: false,
          lastUpdated: '1 gün önce',
          createdAt: '5 Eylül 2024'
        },
        {
          id: 3,
          title: 'Hayvanlar ve Sesler',
          titleEn: 'Animals and Sounds',
          program: 'Playful Learning (2-5 Yaş)',
          programId: 2,
          order: 1,
          duration: '25 dakika',
          type: 'video',
          status: 'published',
          views: 2341,
          completionRate: 89,
          hasVideo: true,
          hasAudio: true,
          hasDocument: true,
          lastUpdated: '3 gün önce',
          createdAt: '15 Ağustos 2024'
        },
        {
          id: 4,
          title: 'Sayılar ve Saymak',
          titleEn: 'Numbers and Counting',
          program: 'Playful Learning (2-5 Yaş)',
          programId: 2,
          order: 2,
          duration: '30 dakika',
          type: 'interactive',
          status: 'draft',
          views: 0,
          completionRate: 0,
          hasVideo: false,
          hasAudio: true,
          hasDocument: true,
          lastUpdated: '5 saat önce',
          createdAt: '10 Ocak 2025'
        },
        {
          id: 5,
          title: 'Günlük Rutinler',
          titleEn: 'Daily Routines',
          program: 'Smart Kids (5-10 Yaş)',
          programId: 3,
          order: 1,
          duration: '35 dakika',
          type: 'video',
          status: 'published',
          views: 1876,
          completionRate: 85,
          hasVideo: true,
          hasAudio: true,
          hasDocument: true,
          lastUpdated: '1 hafta önce',
          createdAt: '1 Temmuz 2024'
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
          icon: GraduationCap,
          color: 'bg-blue-100 text-blue-600'
        },
        {
          label: 'Yayınlanan',
          value: lessons.filter(l => l.status === 'published').length,
          icon: CheckCircle,
          color: 'bg-green-100 text-green-600'
        },
        {
          label: 'Toplam Görüntülenme',
          value: lessons.reduce((sum, l) => sum + l.views, 0).toLocaleString(),
          icon: Eye,
          color: 'bg-purple-100 text-purple-600'
        },
        {
          label: 'Ort. Tamamlanma',
          value: `${Math.round(lessons.reduce((sum, l) => sum + l.completionRate, 0) / lessons.length)}%`,
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-600'
        },
      ];

      const getStatusBadge = (status: string) => {
        const config = {
          published: { label: 'Yayında', variant: 'default' as const, icon: CheckCircle },
          draft: { label: 'Taslak', variant: 'secondary' as const, icon: AlertCircle },
          archived: { label: 'Arşiv', variant: 'outline' as const, icon: XCircle },
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
          video: { label: 'Video', icon: Video, color: 'bg-blue-100 text-blue-700' },
          interactive: { label: 'İnteraktif', icon: Play, color: 'bg-purple-100 text-purple-700' },
          document: { label: 'Doküman', icon: FileText, color: 'bg-green-100 text-green-700' },
        };
        const typeConfig = config[type as keyof typeof config];
        const Icon = typeConfig.icon;
        return (
          <Badge variant="outline" className={typeConfig.color}>
            <Icon className="h-3 w-3 mr-1" />
            {typeConfig.label}
          </Badge>
        );
      };

      const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            lesson.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProgram = selectedProgram === 'all' || lesson.programId.toString() === selectedProgram;
        const matchesStatus = selectedStatus === 'all' || lesson.status === selectedStatus;
        return matchesSearch && matchesProgram && matchesStatus;
      });

      return (
        <div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ders Yönetimi</h1>
                <p className="text-gray-600 mt-2">Ders içeriklerini görüntüleyin ve yönetin</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ders
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ders ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm Programlar</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id.toString()}>
                        {program.name}
                      </option>
                    ))}
                  </select>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle>Ders Listesi ({filteredLessons.length})</CardTitle>
              <CardDescription>Tüm ders içerikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                      {lesson.order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        {getTypeBadge(lesson.type)}
                        {getStatusBadge(lesson.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{lesson.titleEn}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                          {lesson.views.toLocaleString()} görüntülenme
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Tamamlanma</p>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${lesson.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{lesson.completionRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {lesson.hasVideo && (
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center" title="Video mevcut">
                            <Video className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {lesson.hasAudio && (
                          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center" title="Ses mevcut">
                            <Play className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                        {lesson.hasDocument && (
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center" title="Doküman mevcut">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredLessons.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Ders bulunamadı</p>
                    <p className="text-gray-500 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };

    export default LessonsManagement;
