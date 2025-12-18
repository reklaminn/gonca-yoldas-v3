import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface Enrollment {
  id: string;
  program_id: string;
  status: string;
  progress: number;
  enrolled_at: string;
  programs: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    age_range: string;
  };
}

export default function MyPrograms() {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEnrollments();
    }
  }, [user, authLoading]);

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          programs (
            id,
            title,
            description,
            image_url,
            age_range
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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

  const stats = [
    {
      label: 'Aktif Kurslar',
      value: enrollments.filter(e => e.status === 'active').length,
      icon: BookOpen,
      color: 'bg-primary/20 text-primary'
    },
    {
      label: 'Tamamlanan',
      value: enrollments.filter(e => e.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500/20 text-green-500'
    },
    {
      label: 'Ortalama İlerleme',
      value: `${Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / (enrollments.length || 1))}%`,
      icon: TrendingUp,
      color: 'bg-blue-500/20 text-blue-500'
    },
    {
      label: 'Toplam Kurs',
      value: enrollments.length,
      icon: Award,
      color: 'bg-yellow-500/20 text-yellow-500'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Programlarım</h1>
        <p className="text-muted-foreground mt-2">Kayıtlı olduğunuz tüm programlar</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
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

      {/* Programs Grid */}
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz programa kayıtlı değilsiniz</h3>
            <p className="text-muted-foreground mb-6">
              Çocuğunuzun gelişimine katkıda bulunacak programlarımızı keşfedin
            </p>
            <Button asChild>
              <Link to="/programs">Programları İncele</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={enrollment.programs.image_url || 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={enrollment.programs.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={
                    enrollment.status === 'active' ? 'bg-primary' :
                    enrollment.status === 'completed' ? 'bg-green-500' :
                    'bg-gray-500'
                  }>
                    {enrollment.status === 'active' ? 'Devam Ediyor' :
                     enrollment.status === 'completed' ? 'Tamamlandı' :
                     'Beklemede'}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{enrollment.programs.title}</CardTitle>
                <CardDescription>{enrollment.programs.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Kayıt: {new Date(enrollment.enrolled_at).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">İlerleme</span>
                    <span className="font-medium">{enrollment.progress || 0}%</span>
                  </div>
                  <Progress value={enrollment.progress || 0} className="h-2" />
                </div>

                <div className="flex gap-2">
                  {enrollment.status === 'active' && (
                    <Button className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Devam Et
                    </Button>
                  )}
                  {enrollment.status === 'completed' && (
                    <Button className="flex-1">
                      <Award className="h-4 w-4 mr-2" />
                      Sertifikayı Gör
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Detaylar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
