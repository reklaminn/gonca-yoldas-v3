import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Clock, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Aktif Programlar',
      value: '0',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Tamamlanan',
      value: '0',
      icon: Award,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Çalışma Saati',
      value: '0s',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Hoş geldin, {profile?.full_name || 'Öğrenci'} 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Öğrenme yolculuğunda bugün neler yapmak istersin?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions / Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Eğitimlerine Başla</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="font-semibold text-gray-900">Henüz bir programa kayıtlı değilsin</h4>
                <p className="text-sm text-gray-500">
                  Çift dilli eğitim programlarımızı inceleyerek hemen başlayabilirsin.
                </p>
              </div>
              <Button onClick={() => navigate('/programs')}>
                Programları İncele <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
