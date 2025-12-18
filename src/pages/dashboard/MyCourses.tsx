import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Calendar,
  CheckCircle,
  Search,
  Filter,
  Award,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: 'active' | 'completed' | 'paused';
  nextLesson?: {
    title: string;
    duration: string;
    scheduledDate: string;
  };
  instructor: string;
  certificate: boolean;
}

export default function MyCourses() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!authLoading && user) {
      fetchCourses();
    }
  }, [user, authLoading]);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch enrollments with program details
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          programs (
            id,
            title,
            description,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Mock courses data (replace with actual data)
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Baby English (0-2 Yaş)',
          description: 'Bebekler için özel tasarlanmış İngilizce programı',
          image: 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=600',
          progress: 65,
          totalLessons: 24,
          completedLessons: 16,
          status: 'active',
          nextLesson: {
            title: 'Ders 17: Renkler ve Şekiller',
            duration: '25 dakika',
            scheduledDate: 'Yarın, 10:00'
          },
          instructor: 'Gonca Yoldaş',
          certificate: false
        },
        {
          id: '2',
          title: 'Playful Learning (2-5 Yaş)',
          description: 'Oyun temelli öğrenme metodolojisi',
          image: 'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg?auto=compress&cs=tinysrgb&w=600',
          progress: 30,
          totalLessons: 36,
          completedLessons: 11,
          status: 'active',
          nextLesson: {
            title: 'Ders 12: Hayvanlar Alemi',
            duration: '30 dakika',
            scheduledDate: 'Çarşamba, 14:00'
          },
          instructor: 'Ayşe Demir',
          certificate: false
        },
        {
          id: '3',
          title: 'Smart Kids (5-10 Yaş)',
          description: 'İleri seviye İngilizce programı',
          image: 'https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=600',
          progress: 100,
          totalLessons: 48,
          completedLessons: 48,
          status: 'completed',
          instructor: 'Mehmet Kaya',
          certificate: true
        },
      ];

      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    completed: courses.filter(c => c.status === 'completed').length,
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Kurslarım</h1>
        <p className="text-[var(--fg-muted)] mt-2">
          Kayıtlı olduğunuz tüm kurslar ve ilerleme durumunuz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Toplam Kurs</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Aktif Kurslar</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-[var(--color-secondary)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Tamamlanan</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
          <Input
            placeholder="Kurs ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--bg-input)] border-[var(--border)]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            className="border-[var(--border)]"
          >
            Tümü
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
            className="border-[var(--border)]"
          >
            Aktif
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
            className="border-[var(--border)]"
          >
            Tamamlanan
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-[var(--fg-muted)] mx-auto mb-4" />
            <p className="text-[var(--fg-muted)] mb-4">
              {searchQuery ? 'Arama kriterlerine uygun kurs bulunamadı' : 'Henüz kayıtlı kursunuz bulunmamaktadır'}
            </p>
            <Button asChild>
              <Link to="/programs">Programları İncele</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-3 gap-0">
                {/* Course Image */}
                <div className="relative h-64 md:h-auto">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={
                      course.status === 'completed' ? 'bg-green-500' :
                      course.status === 'active' ? 'bg-[var(--color-primary)]' :
                      'bg-gray-500'
                    }>
                      {course.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Tamamlandı
                        </>
                      ) : course.status === 'active' ? (
                        'Devam Ediyor'
                      ) : (
                        'Duraklatıldı'
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Course Info */}
                <div className="md:col-span-2 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[var(--fg)] mb-2">
                        {course.title}
                      </h3>
                      <p className="text-[var(--fg-muted)] mb-4">{course.description}</p>

                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--fg)]">
                            İlerleme: {course.completedLessons}/{course.totalLessons} Ders
                          </span>
                          <span className="text-sm font-bold text-[var(--color-primary)]">
                            {course.progress}%
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      {/* Course Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                          <BookOpen className="h-4 w-4" />
                          <span>Eğitmen: {course.instructor}</span>
                        </div>
                      </div>

                      {/* Next Lesson */}
                      {course.nextLesson && (
                        <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-4 mb-6">
                          <h4 className="font-semibold text-[var(--fg)] mb-2 flex items-center gap-2">
                            <Play className="h-4 w-4 text-[var(--color-primary)]" />
                            Sıradaki Ders
                          </h4>
                          <p className="text-[var(--fg)] mb-2">{course.nextLesson.title}</p>
                          <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.nextLesson.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{course.nextLesson.scheduledDate}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Certificate */}
                      {course.certificate && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                          <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-yellow-500" />
                            <div>
                              <h4 className="font-semibold text-[var(--fg)]">Sertifika Kazandınız!</h4>
                              <p className="text-sm text-[var(--fg-muted)]">Bu kursu başarıyla tamamladınız</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {course.status === 'active' && (
                        <>
                          <Button>
                            <Play className="h-4 w-4 mr-2" />
                            Derse Devam Et
                          </Button>
                          <Button variant="outline" className="border-[var(--border)]">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Müfredata Bak
                          </Button>
                        </>
                      )}
                      {course.status === 'completed' && (
                        <>
                          <Button>
                            <Award className="h-4 w-4 mr-2" />
                            Sertifikayı Görüntüle
                          </Button>
                          <Button variant="outline" className="border-[var(--border)]">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Dersleri Tekrar İzle
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Explore More */}
      <Card className="border-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Daha Fazla Kurs Keşfedin</h3>
              <p className="text-white/80">
                Çocuğunuzun gelişimine katkıda bulunacak yeni programlarımızı inceleyin
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild className="bg-white text-[var(--color-primary)] hover:bg-white/90">
              <Link to="/programs">
                Programları İncele
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
