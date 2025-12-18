import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // This component might not be needed after changes
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

export default function DashboardHome() {
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
        studyTime: 0,
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // progressPercentage calculation removed as "Toplam İlerleme" card is removed.

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Hoş Geldiniz, {user?.full_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Öğrenme yolculuğunuza kaldığınız yerden devam edin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Changed lg:grid-cols-4 to lg:grid-cols-3 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Aktif Kurslar</p>
                <p className="text-3xl font-bold">{stats.activeCourses}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tamamlanan Dersler</p>
                <p className="text-3xl font-bold">{stats.completedLessons}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* "Toplam İlerleme" card removed */}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sertifikalar</p>
                <p className="text-3xl font-bold">{stats.certificates}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning section removed. Only "Tüm Kurslarım" quick action remains in this column. */}
        <div className="lg:col-span-2"> {/* Removed space-y-6 as there's only one main child */}
          {/* Quick Actions */}
          {/* Removed inner grid wrapper as there's only one card left */}
          <Card className="bg-gradient-to-br from-primary to-blue-600 text-white">
            <CardContent className="pt-6">
              <BookOpen className="h-8 w-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Tüm Kurslarım</h3>
              <p className="text-white/80 text-sm mb-4">
                Kayıtlı olduğunuz tüm kurslara göz atın
              </p>
              <Button variant="secondary" asChild className="w-full">
                <Link to="/dashboard/programs">
                  Kurslara Git
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* "İlerleme Takibi" quick action card removed */}
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
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
                        'bg-primary/20'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          activity.type === 'lesson' ? 'text-green-500' :
                          activity.type === 'achievement' ? 'text-yellow-500' :
                          'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
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
