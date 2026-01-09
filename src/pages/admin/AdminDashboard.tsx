import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  ShoppingBag,
  UserPlus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Stats {
  totalUsers: number;
  totalPrograms: number;
  totalOrders: number;
  newUsersThisMonth: number;
  activePrograms: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPrograms: 0,
    totalOrders: 0,
    newUsersThisMonth: 0,
    activePrograms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      fetchStats();
    }
  }, [session?.access_token]);

  const fetchStats = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);

      // Fetch users count
      const usersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,created_at`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (usersResponse.ok) {
        const users = await usersResponse.json();
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsers = users.filter((u: any) => new Date(u.created_at) >= firstDayOfMonth);
        
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          newUsersThisMonth: newUsers.length,
        }));
      }

      // Fetch programs count
      const programsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/programs?select=id,is_active`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (programsResponse.ok) {
        const programs = await programsResponse.json();
        const activePrograms = programs.filter((p: any) => p.is_active);
        
        setStats(prev => ({
          ...prev,
          totalPrograms: programs.length,
          activePrograms: activePrograms.length,
        }));
      }

      // Fetch orders count
      const ordersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=id`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
        }));
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      change: `+${stats.newUsersThisMonth} bu ay`,
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up',
    },
    {
      title: 'Aktif Programlar',
      value: stats.activePrograms,
      change: `${stats.totalPrograms} toplam`,
      icon: BookOpen,
      color: 'bg-purple-500',
      trend: 'up',
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      change: 'Tüm zamanlar',
      icon: ShoppingBag,
      color: 'bg-green-500',
      trend: 'up',
    },
  ];

  const quickActions = [
    {
      title: 'Yeni Kullanıcı Ekle',
      description: 'Sisteme yeni kullanıcı ekleyin',
      icon: UserPlus,
      action: () => navigate('/admin/users/new'),
      color: 'bg-blue-500',
    },
    {
      title: 'Yeni Program Oluştur',
      description: 'Yeni eğitim programı ekleyin',
      icon: BookOpen,
      action: () => navigate('/admin/programs/new'),
      color: 'bg-purple-500',
    },
    {
      title: 'Siparişleri Görüntüle',
      description: 'Tüm siparişleri yönetin',
      icon: ShoppingBag,
      action: () => navigate('/admin/orders'),
      color: 'bg-green-500',
    },
    {
      title: 'İçerik Yönetimi',
      description: 'Site içeriğini düzenleyin',
      icon: Activity,
      action: () => navigate('/admin/content'),
      color: 'bg-yellow-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Genel Bakış</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sistemin genel durumunu görüntüleyin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={index} className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendIcon className={`h-5 w-5 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={action.action}
              >
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
