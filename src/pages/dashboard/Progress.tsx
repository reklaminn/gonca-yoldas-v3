import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, Clock, CheckCircle, Star } from 'lucide-react';

export default function ProgressPage() {
  const overallStats = {
    totalLessons: 72,
    completedLessons: 27,
    totalHours: 36,
    studiedHours: 13.5,
    averageScore: 87,
    certificates: 1
  };

  const programProgress = [
    {
      id: 1,
      title: 'Baby English (0-2 Yaş)',
      totalLessons: 24,
      completedLessons: 16,
      progress: 67,
      averageScore: 92,
      lastActivity: '2 saat önce',
      status: 'active'
    },
    {
      id: 2,
      title: 'Playful Learning (2-5 Yaş)',
      totalLessons: 36,
      completedLessons: 11,
      progress: 31,
      averageScore: 85,
      lastActivity: '1 gün önce',
      status: 'active'
    },
    {
      id: 3,
      title: 'Smart Kids (5-10 Yaş)',
      totalLessons: 48,
      completedLessons: 48,
      progress: 100,
      averageScore: 94,
      lastActivity: '1 hafta önce',
      status: 'completed'
    },
  ];

  const achievements = [
    {
      id: 1,
      title: 'İlk Adım',
      description: 'İlk dersinizi tamamladınız',
      icon: Star,
      earned: true,
      date: '1 Ocak 2025'
    },
    {
      id: 2,
      title: 'Hızlı Öğrenen',
      description: '5 dersi 1 haftada tamamladınız',
      icon: TrendingUp,
      earned: true,
      date: '8 Ocak 2025'
    },
    {
      id: 3,
      title: 'Mükemmeliyetçi',
      description: '10 derste %90+ puan aldınız',
      icon: Award,
      earned: true,
      date: '15 Ocak 2025'
    },
    {
      id: 4,
      title: 'Kararlı',
      description: '30 gün üst üste ders çalıştınız',
      icon: Target,
      earned: false,
      date: null
    },
  ];

  const recentActivities = [
    {
      id: 1,
      lesson: 'Renkler ve Şekiller',
      program: 'Baby English',
      score: 95,
      date: '2 saat önce',
      status: 'completed'
    },
    {
      id: 2,
      lesson: 'Hayvanlar Alemi',
      program: 'Playful Learning',
      score: 88,
      date: '1 gün önce',
      status: 'completed'
    },
    {
      id: 3,
      lesson: 'Sayılar ve Matematik',
      program: 'Baby English',
      score: 92,
      date: '2 gün önce',
      status: 'completed'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">İlerleme Takibi</h1>
        <p className="text-muted-foreground mt-2">Öğrenme yolculuğunuzdaki gelişiminizi takip edin</p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tamamlanan Dersler</p>
                <p className="text-2xl font-bold">{overallStats.completedLessons}/{overallStats.totalLessons}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Çalışma Saati</p>
                <p className="text-2xl font-bold">{overallStats.studiedHours}/{overallStats.totalHours}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ortalama Puan</p>
                <p className="text-2xl font-bold">{overallStats.averageScore}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sertifikalar</p>
                <p className="text-2xl font-bold">{overallStats.certificates}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Program İlerlemesi</CardTitle>
          <CardDescription>Her programdaki ilerlemeniz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {programProgress.map((program) => (
            <div key={program.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{program.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {program.completedLessons}/{program.totalLessons} ders • Ortalama: {program.averageScore}%
                  </p>
                </div>
                <Badge className={
                  program.status === 'active' ? 'bg-primary' :
                  program.status === 'completed' ? 'bg-green-500' :
                  'bg-gray-500'
                }>
                  {program.status === 'active' ? 'Devam Ediyor' :
                   program.status === 'completed' ? 'Tamamlandı' :
                   'Beklemede'}
                </Badge>
              </div>
              <Progress value={program.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Son aktivite: {program.lastActivity}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Başarılar</CardTitle>
            <CardDescription>Kazandığınız rozetler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    achievement.earned
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/50 border-border opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      achievement.earned ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && achievement.date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Kazanıldı: {achievement.date}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Tamamladığınız son dersler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{activity.lesson}</h4>
                  <p className="text-sm text-muted-foreground">{activity.program}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    activity.score >= 90 ? 'text-green-500' :
                    activity.score >= 70 ? 'text-blue-500' :
                    'text-yellow-500'
                  }`}>
                    {activity.score}%
                  </div>
                  <Badge className="mt-1 bg-green-500">
                    Tamamlandı
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
