import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Play,
  Calendar,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  completedLessons: number;
  totalLessons: number;
  certificates: number;
  studyTime: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson' | 'achievement' | 'certificate';
  title: string;
  description: string;
  date: string;
  icon: any;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    activeCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    certificates: 0,
    studyTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      // Fetch progress
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Fetch certificates
      const { data: certificates, error: certificatesError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id);

      if (certificatesError) throw certificatesError;

      // Calculate stats
      const activeCourses = enrollments?.filter(e => e.status === 'active').length || 0;
      const completedLessons = progress?.filter(p => p.completed).length || 0;
      const totalLessons = progress?.length || 0;

      setStats({
        totalCourses: enrollments?.length || 0,
        activeCourses,
        completedLessons,
        totalLessons,
        certificates: certificates?.length || 0,
        studyTime: 0, // Calculate from progress data
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'lesson',
          title: 'Ders 5 Tamamlandı',
          description: 'Baby English - Renkler ve Şekiller',
          date: '2 saat önce',
          icon: CheckCircle,
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Yeni Rozet Kazandınız',
          description: 'Hızlı Öğrenen - 5 dersi 1 haftada tamamladınız',
          date: '1 gün önce',
          icon: Award,
        },
        {
          id: '3',
          type: 'lesson',
          title: 'Ders 4 Tamamlandı',
          description: 'Playful Learning - Hayvanlar',
          date: '2 gün önce',
          icon: CheckCircle,
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const progressPercentage = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">
          Hoş Geldiniz, {user?.full_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-[var(--fg-muted)] mt-2">
          Öğrenme yolculuğunuza kaldığınız yerden devam edin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Aktif Kurslar</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{stats.activeCourses}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Tamamlanan Dersler</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{stats.completedLessons}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Toplam İlerleme</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{progressPercentage}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[var(--color-secondary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">Sertifikalar</p>
                <p className="text-3xl font-bold text-[var(--fg)]">{stats.certificates}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Öğrenmeye Devam Et</CardTitle>
              <CardDescription className="text-[var(--fg-muted)]">
                Kaldığınız yerden devam edin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.activeCourses === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-[var(--fg-muted)] mx-auto mb-4" />
                  <p className="text-[var(--fg-muted)] mb-4">
                    Henüz aktif kursunuz bulunmamaktadır
                  </p>
                  <Button asChild>
                    <Link to="/programs">
                      Programları İncele
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock course card */}
                  <div className="border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--bg-hover)] transition-colors">
                    <div className="flex items-start gap-4">
                      <img
                        src="https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=200"
                        alt="Course"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-[var(--fg)]">Baby English (0-2 Yaş)</h3>
                            <p className="text-sm text-[var(--fg-muted)]">Ders 5: Renkler ve Şekiller</p>
                          </div>
                          <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                            Devam Ediyor
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--fg-muted)]">İlerleme</span>
                            <span className="font-medium text-[var(--fg)]">65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                          <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>25 dakika</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Yarın, 10:00</span>
                            </div>
                          </div>
                        </div>
                        <Button className="mt-4 w-full sm:w-auto">
                          <Play className="h-4 w-4 mr-2" />
                          Derse Devam Et
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-[var(--border)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Tüm Kurslarım</h3>
                <p className="text-white/80 text-sm mb-4">
                  Kayıtlı olduğunuz tüm kurslara göz atın
                </p>
                <Button variant="secondary" asChild className="w-full">
                  <Link to="/dashboard/courses">
                    Kurslara Git
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[var(--border)] bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] text-white">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 mb-4" />
                <h3 className="font-semibold text-lg mb-2">İlerleme Takibi</h3>
                <p className="text-white/80 text-sm mb-4">
                  Detaylı ilerleme raporlarınızı görüntüleyin
                </p>
                <Button variant="secondary" asChild className="w-full">
                  <Link to="/dashboard/progress">
                    İlerlememi Gör
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Son Aktiviteler</CardTitle>
              <CardDescription className="text-[var(--fg-muted)]">
                Son etkinlikleriniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'lesson' ? 'bg-green-500/20' :
                        activity.type === 'achievement' ? 'bg-yellow-500/20' :
                        'bg-[var(--color-primary)]/20'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          activity.type === 'lesson' ? 'text-green-500' :
                          activity.type === 'achievement' ? 'text-yellow-500' :
                          'text-[var(--color-primary)]'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--fg)] text-sm">
                          {activity.title}
                        </p>
                        <p className="text-sm text-[var(--fg-muted)] truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-[var(--fg-muted)] mt-1">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
