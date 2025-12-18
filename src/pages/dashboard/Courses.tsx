import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, Play, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Courses: React.FC = () => {
  // Mock data - replace with actual data from Supabase
  const courses = [
    {
      id: '1',
      title: 'İngilizce Temel Seviye',
      description: 'Sıfırdan İngilizce öğrenmeye başlayın',
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      duration: '12 hafta',
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '2',
      title: 'İngilizce İleri Seviye',
      description: 'İleri seviye konuşma ve yazma becerileri',
      progress: 30,
      totalLessons: 32,
      completedLessons: 10,
      duration: '16 hafta',
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '3',
      title: 'İş İngilizcesi',
      description: 'Profesyonel iş hayatı için İngilizce',
      progress: 0,
      totalLessons: 20,
      completedLessons: 0,
      duration: '10 hafta',
      status: 'locked',
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[var(--fg)]">Kurslarım</h1>
        <p className="text-[var(--fg-muted)] mt-2">
          Kayıtlı olduğunuz kursları görüntüleyin ve devam edin
        </p>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-[var(--border)] bg-[var(--bg-card)] hover:shadow-lg transition-all overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.status === 'locked' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="h-12 w-12 text-white" />
                  </div>
                )}
                {course.status === 'active' && (
                  <Badge className="absolute top-4 right-4 bg-[var(--color-primary)]">
                    Aktif
                  </Badge>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-[var(--fg)]">{course.title}</CardTitle>
                <CardDescription className="text-[var(--fg-muted)]">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                {course.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--fg-muted)]">İlerleme</span>
                      <span className="font-semibold text-[var(--fg)]">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-[var(--fg-muted)]">
                      {course.completedLessons} / {course.totalLessons} ders tamamlandı
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)]">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalLessons} ders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full"
                  disabled={course.status === 'locked'}
                  variant={course.status === 'locked' ? 'outline' : 'default'}
                >
                  {course.status === 'locked' ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Kilitli
                    </>
                  ) : course.progress > 0 ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Devam Et
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Başla
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-[var(--fg-muted)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--fg)] mb-2">
                Henüz kurs yok
              </h3>
              <p className="text-[var(--fg-muted)] text-center mb-4">
                Öğrenmeye başlamak için bir kursa kaydolun
              </p>
              <Button>
                Kursları Keşfet
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Courses;
