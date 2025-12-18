import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  ShoppingBag, 
  TrendingUp,
  DollarSign,
  UserPlus,
  FileText,
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const SHOW_ORDER_AMOUNTS = import.meta.env.VITE_SHOW_ORDER_AMOUNTS === 'true';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrograms: 0,
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch programs count
      const { count: programsCount } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true });

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('payment_status, total_amount');

      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.payment_status === 'completed').length || 0;
      const pendingOrders = orders?.filter(o => o.payment_status === 'pending').length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalPrograms: programsCount || 0,
        totalOrders,
        totalRevenue,
        completedOrders,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      description: 'Kayıtlı kullanıcı sayısı'
    },
    {
      title: 'Aktif Programlar',
      value: stats.totalPrograms,
      change: '+3',
      trend: 'up',
      icon: BookOpen,
      color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
      description: 'Yayında olan programlar'
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
      description: `${stats.completedOrders} tamamlandı`
    },
    ...(SHOW_ORDER_AMOUNTS ? [{
      title: 'Gelir',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
      description: 'Toplam gelir'
    }] : []),
  ];

  const quickActions = [
    {
      title: 'Yeni Kullanıcı Ekle',
      description: 'Sisteme manuel kullanıcı ekleyin',
      icon: UserPlus,
      href: '/admin/students',
      color: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'
    },
    {
      title: 'Program Oluştur',
      description: 'Yeni eğitim programı ekleyin',
      icon: BookOpen,
      href: '/admin/programs',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'İçerik Yönetimi',
      description: 'Site içeriğini düzenleyin',
      icon: FileText,
      href: '/admin/content',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Genel Bakış</h1>
        <p className="text-[var(--fg-muted)] mt-2">Sistem istatistikleri ve son aktiviteler</p>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${SHOW_ORDER_AMOUNTS ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = ArrowUpRight;

          return (
            <Card key={index} className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                    <TrendIcon className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-sm text-[var(--fg-muted)] mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-[var(--fg)] mb-1">{stat.value}</p>
                <p className="text-xs text-[var(--fg-muted)]">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={action.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--color-primary)]">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} text-white mb-4 transition-transform hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-[var(--fg)] mb-2">{action.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)]">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[var(--fg)]">Son Siparişler</CardTitle>
                <CardDescription className="text-[var(--fg-muted)]">En son gelen siparişler</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/orders">Tümünü Gör</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border)]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-[var(--fg)]">ORD-2025-001</p>
                    <Badge className="bg-green-500">Tamamlandı</Badge>
                  </div>
                  <p className="text-sm text-[var(--fg-muted)]">Baby English Program</p>
                </div>
                {SHOW_ORDER_AMOUNTS && (
                  <div className="text-right ml-4">
                    <p className="font-bold text-[var(--fg)]">₺2,499</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[var(--fg)]">Yeni Kullanıcılar</CardTitle>
                <CardDescription className="text-[var(--fg-muted)]">Son kayıt olan kullanıcılar</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/students">Tümünü Gör</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border)]">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  AY
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--fg)]">Ayşe Yılmaz</p>
                  <p className="text-sm text-[var(--fg-muted)]">ayse@example.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
