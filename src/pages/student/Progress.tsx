import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';

export default function ProgressPage() {
  const overallStats = [
    {
      label: 'Toplam İlerleme',
      value: '68%',
      icon: TrendingUp,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-primary)]/20'
    },
    {
      label: 'Tamamlanan Dersler',
      value: '24/35',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Toplam Çalışma Saati',
      value: '18.5 saat',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Kazanılan Rozet',
      value: '7',
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    },
  ];

  const courseProgress = [
    {
      id: 1,
      title: 'Baby English (0-2 Yaş)',
      progress: 75,
      completedLessons: 15,
      totalLessons: 20,
      lastActivity: '2 saat önce',
      status: 'active'
    },
    {
      id: 2,
      title: 'Playful Learning (2-5 Yaş)',
      progress: 60,
      completedLessons: 9,
      totalLessons: 15,
      lastActivity: '1 gün önce',
      status: 'active'
    },
  ];

  const achievements = [
    {
      id: 1,
      title: 'İlk Adım',
      description: 'İlk dersinizi tamamladınız',
      icon: Star,
      earned: true,
      date: '15 Ocak 2025'
    },
    {
      id: 2,
      title: 'Hızlı Öğrenen',
      description: '5 dersi 1 haftada tamamladınız',
      icon: TrendingUp,
      earned: true,
      date: '18 Ocak 2025'
    },
    {
      id: 3,
      title: 'Kararlı',
      description: '7 gün üst üste ders yaptınız',
      icon: Target,
      earned: true,
      date: '20 Ocak 2025'
    },
    {
      id: 4,
      title: 'Uzman',
      description: 'Bir programı tamamlayın',
      icon: Award,
      earned: false,
      date: null
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">İlerleme Takibi</h1>
        <p className="text-[var(--fg-muted)] mt-2">Öğrenme yolculuğunuzu takip edin</p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overallStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--fg-muted)] mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-[var(--fg)]">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Course Progress */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--fg)]">Kurs İlerlemesi</CardTitle>
          <CardDescription className="text-[var(--fg-muted)]">
            Her kurs için detaylı ilerleme durumu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {courseProgress.map((course) => (
            <div key={course.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--fg)]">{course.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)]">
                    {course.completedLessons}/{course.totalLessons} ders tamamlandı
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--fg)]">{course.progress}%</p>
                  <p className="text-xs text-[var(--fg-muted)]">{course.lastActivity}</p>
                </div>
              </div>
              <Progress value={course.progress} className="h-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--fg)]">Başarılar</CardTitle>
          <CardDescription className="text-[var(--fg-muted)]">
            Kazandığınız rozetler ve başarılar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.earned
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--border)] bg-[var(--bg-card)] opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.earned
                        ? 'bg-[var(--color-primary)]/20'
                        : 'bg-gray-500/20'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        achievement.earned
                          ? 'text-[var(--color-primary)]'
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-[var(--fg)]">{achievement.title}</h4>
                        {achievement.earned && (
                          <Badge className="bg-[var(--color-primary)]">
                            Kazanıldı
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--fg-muted)] mb-2">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-[var(--fg-muted)]">
                          {achievement.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
