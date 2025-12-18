import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, Users } from 'lucide-react';

export default function Schedule() {
  const upcomingSessions = [
    {
      id: 1,
      title: 'Baby English - Ders 5',
      program: 'Baby English (0-2 Yaş)',
      date: '2025-01-25',
      time: '10:00 - 10:45',
      duration: '45 dakika',
      type: 'online',
      instructor: 'Gonca Yoldaş',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Playful Learning - Ders 12',
      program: 'Playful Learning (2-5 Yaş)',
      date: '2025-01-26',
      time: '14:00 - 14:45',
      duration: '45 dakika',
      type: 'online',
      instructor: 'Ayşe Demir',
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Baby English - Ders 6',
      program: 'Baby English (0-2 Yaş)',
      date: '2025-01-27',
      time: '10:00 - 10:45',
      duration: '45 dakika',
      type: 'online',
      instructor: 'Gonca Yoldaş',
      status: 'scheduled'
    },
  ];

  const pastSessions = [
    {
      id: 4,
      title: 'Baby English - Ders 4',
      program: 'Baby English (0-2 Yaş)',
      date: '2025-01-23',
      time: '10:00 - 10:45',
      duration: '45 dakika',
      type: 'online',
      instructor: 'Gonca Yoldaş',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Playful Learning - Ders 11',
      program: 'Playful Learning (2-5 Yaş)',
      date: '2025-01-22',
      time: '14:00 - 14:45',
      duration: '45 dakika',
      type: 'online',
      instructor: 'Ayşe Demir',
      status: 'completed'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Takvim</h1>
        <p className="text-[var(--fg-muted)] mt-2">Yaklaşan ve geçmiş dersleriniz</p>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--fg)] mb-4">Yaklaşan Dersler</h2>
        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="border-[var(--border)] bg-[var(--bg-card)] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--fg)]">{session.title}</h3>
                        <p className="text-sm text-[var(--fg-muted)]">{session.program}</p>
                      </div>
                      <Badge className="bg-[var(--color-primary)]">
                        {session.type === 'online' ? 'Online' : 'Yüz Yüze'}
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.date).toLocaleDateString('tr-TR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Clock className="h-4 w-4" />
                        <span>{session.time} ({session.duration})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Users className="h-4 w-4" />
                        <span>Eğitmen: {session.instructor}</span>
                      </div>
                      {session.type === 'online' && (
                        <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                          <Video className="h-4 w-4" />
                          <span>Zoom Toplantısı</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button>
                      <Video className="h-4 w-4 mr-2" />
                      Derse Katıl
                    </Button>
                    <Button variant="outline">
                      Takvime Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--fg)] mb-4">Geçmiş Dersler</h2>
        <div className="space-y-4">
          {pastSessions.map((session) => (
            <Card key={session.id} className="border-[var(--border)] bg-[var(--bg-card)] opacity-75">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--fg)]">{session.title}</h3>
                        <p className="text-sm text-[var(--fg-muted)]">{session.program}</p>
                      </div>
                      <Badge className="bg-green-500">
                        Tamamlandı
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.date).toLocaleDateString('tr-TR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Clock className="h-4 w-4" />
                        <span>{session.time} ({session.duration})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Users className="h-4 w-4" />
                        <span>Eğitmen: {session.instructor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline">
                      Kaydı İzle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
