import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Clock,
  BookOpen,
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CourseProgress {
  id: string;
  name: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: string;
  lastActivity: string;
  strengths: string[];
  improvements: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string | null;
  earned: boolean;
}

export default function MyProgress() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      // Simulate data loading
      setTimeout(() => setLoading(false), 500);
    }
  }, [user, authLoading]);

  const overallStats = [
    {
      label: 'Toplam Öğrenme Süresi',
      value: '48 saat',
      icon: Clock,
      color: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
      change: '+12% bu ay'
    },
    {
      label: 'Tamamlanan Dersler',
      value: '27',
      icon: CheckCircle,
      color: 'bg-green-500/20 text-green-500',
      change: '+5 bu hafta'
    },
    {
      label: 'Ortalama Puan',
      value: '92%',
      icon: Star,
      color: 'bg-yellow-500/20 text-yellow-500',
      change: '+3% bu ay'
    },
    {
      label: 'Kazanılan Rozetler',
      value: '12',
      icon: Award,
      color: 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]',
      change: '+2 bu hafta'
    },
  ];

  const courseProgress: CourseProgress[] = [
    {
      id: '1',
      name: 'Baby English (0-2 Yaş)',
      progress: 65,
      completedLessons: 16,
      totalLessons: 24,
      averageScore: 95,
      timeSpent: '18 saat',
      lastActivity: '2 saat önce',
      strengths: ['Kelime Dağarcığı', 'Dinleme'],
      improvements: ['Telaffuz']
    },
    {
      id: '2',
      name: 'Playful Learning (2-5 Yaş)',
      progress: 30,
      completedLessons: 11,
      totalLessons: 36,
      averageScore: 88,
      timeSpent: '15 saat',
      lastActivity: '1 gün önce',
      strengths: ['Oyun Aktiviteleri', 'Etkileşim'],
      improvements: ['Konsantrasyon', 'Kelime Hatırlama']
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'İlk Adım',
      description: 'İlk dersinizi tamamladınız',
      icon: '🎯',
      date: '1 Ocak 2025',
      earned: true
    },
    {
      id: '2',
      title: 'Hızlı Öğrenen',
      description: '10 dersi 1 haftada tamamladınız',
      icon: '⚡',
      date: '8 Ocak 2025',
      earned: true
    },
    {
      id: '3',
      title: 'Mükemmeliyetçi',
      description: '5 dersten 100 puan aldınız',
      icon: '⭐',
      date: '12 Ocak 2025',
      earned: true
    },
    {
      id: '4',
      title: 'Kararlı Öğrenci',
      description: '30 gün üst üste ders yaptınız',
      icon: '🔥',
      date: null,
      earned: false
    },
  ];

  const weeklyActivity = [
    { day: 'Pzt', lessons: 2, minutes: 45 },
    { day: 'Sal', lessons: 1, minutes: 30 },
    { day: 'Çar', lessons: 3, minutes: 75 },
    { day: 'Per', lessons: 2, minutes: 50 },
    { day: 'Cum', lessons: 1, minutes: 25 },
    { day: 'Cmt', lessons: 0, minutes: 0 },
    { day: 'Paz', lessons: 2, minutes: 60 },
  ];

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
        <h1 className="text-3xl font-bold text-[var(--fg)]">İlerleme Takibi</h1>
        <p className="text-[var(--fg-muted)] mt-2">Öğrenme yolculuğunuzun detaylı analizi</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overallStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-[var(--fg-muted)] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--fg)] mb-1">{stat.value}</p>
                <p className="text-xs text-green-500 font-medium">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-[var(--bg-card)] border border-[var(--border)]">
          <TabsTrigger value="courses">Kurs İlerlemesi</TabsTrigger>
          <TabsTrigger value="activity">Haftalık Aktivite</TabsTrigger>
          <TabsTrigger value="achievements">Başarılar</TabsTrigger>
        </TabsList>

        {/* Course Progress */}
        <TabsContent value="courses" className="space-y-6">
          {courseProgress.map((course) => (
            <Card key={course.id} className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-[var(--fg)]">{course.name}</CardTitle>
                    <CardDescription className="text-[var(--fg-muted)]">
                      Son aktivite: {course.lastActivity}
                    </CardDescription>
                  </div>
                  <Badge className="text-lg px-4 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                    {course.averageScore}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--fg)]">
                        {course.completedLessons}/{course.totalLessons} Ders Tamamlandı
                      </span>
                      <span className="text-sm font-bold text-[var(--color-primary)]">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-3" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-[var(--fg-muted)]" />
                        <span className="text-sm text-[var(--fg-muted)]">Toplam Süre</span>
                      </div>
                      <p className="text-xl font-bold text-[var(--fg)]">{course.timeSpent}</p>
                    </div>
                    <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-[var(--fg-muted)]" />
                        <span className="text-sm text-[var(--fg-muted)]">Ortalama Puan</span>
                      </div>
                      <p className="text-xl font-bold text-[var(--fg)]">{course.averageScore}%</p>
                    </div>
                    <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-[var(--fg-muted)]" />
                        <span className="text-sm text-[var(--fg-muted)]">İlerleme</span>
                      </div>
                      <p className="text-xl font-bold text-[var(--fg)]">{course.progress}%</p>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-[var(--fg)] mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Güçlü Yönler
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {course.strengths.map((strength, index) => (
                          <Badge key={index} className="bg-green-500/20 text-green-500">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {course.improvements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[var(--fg)] mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-yellow-500" />
                          Gelişim Alanları
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {course.improvements.map((improvement, index) => (
                            <Badge key={index} className="bg-yellow-500/20 text-yellow-500">
                              {improvement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Weekly Activity */}
        <TabsContent value="activity">
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Bu Haftaki Aktiviteleriniz</CardTitle>
              <CardDescription className="text-[var(--fg-muted)]">
                Günlük ders ve öğrenme süresi dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {weeklyActivity.map((day, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-[var(--fg)] w-12">{day.day}</span>
                        <span className="text-sm text-[var(--fg-muted)]">
                          {day.lessons} ders • {day.minutes} dakika
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-primary)]">
                        {day.minutes > 0 ? `${Math.round((day.minutes / 75) * 100)}%` : '0%'}
                      </span>
                    </div>
                    <Progress 
                      value={day.minutes > 0 ? (day.minutes / 75) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-[var(--fg-muted)] mb-1">Toplam Ders</p>
                  <p className="text-2xl font-bold text-[var(--color-primary)]">
                    {weeklyActivity.reduce((sum, day) => sum + day.lessons, 0)}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-[var(--fg-muted)] mb-1">Toplam Süre</p>
                  <p className="text-2xl font-bold text-green-500">
                    {weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} dk
                  </p>
                </div>
                <div className="bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-[var(--fg-muted)] mb-1">Günlük Ortalama</p>
                  <p className="text-2xl font-bold text-[var(--color-secondary)]">
                    {Math.round(weeklyActivity.reduce((sum, day) => sum + day.minutes, 0) / 7)} dk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Başarılarınız</CardTitle>
              <CardDescription className="text-[var(--fg-muted)]">
                Kazandığınız rozetler ve başarılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative rounded-lg border-2 p-6 transition-all ${
                      achievement.earned
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-[var(--border)] bg-[var(--bg-hover)] opacity-60'
                    }`}
                  >
                    {achievement.earned && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold text-[var(--fg)] mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-[var(--fg-muted)] mb-3">
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <div className="flex items-center gap-1 text-xs text-[var(--fg-muted)]">
                        <Calendar className="h-3 w-3" />
                        <span>{achievement.date}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
