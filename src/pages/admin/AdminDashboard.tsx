import React, { useState, useEffect } from 'react';
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
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const SHOW_ORDER_AMOUNTS = import.meta.env.VITE_SHOW_ORDER_AMOUNTS === 'true';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  console.log('🎯 [AdminDashboard] Component mounting...');

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuthStore(); // ✅ Session'dan access_token al

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('🔵 [AdminDashboard] Fetching dashboard data...');
    
    try {
      setLoading(true);
      
      if (!session?.access_token) {
        console.error('❌ [AdminDashboard] No access token');
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      console.log('✅ [AdminDashboard] Access token available, fetching...');

      // Fetch users
      const usersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const usersData = await usersResponse.json();

      // Fetch orders
      const ordersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const ordersData = await ordersResponse.json();

      console.log('✅ [AdminDashboard] Data fetched:', {
        users: usersData.length,
        orders: ordersData.length
      });

      // Calculate stats
      const completedOrders = ordersData.filter((o: any) => o.payment_status === 'completed');
      const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

      setStats({
        totalUsers: usersData.length,
        totalOrders: ordersData.length,
        completedOrders: completedOrders.length,
        totalRevenue,
      });

      setRecentOrders(ordersData.slice(0, 4));
      setRecentUsers(usersData.slice(0, 3));

    } catch (error: any) {
      console.error('❌ [AdminDashboard] Error:', error);
      toast.error('Dashboard verileri yüklenirken hata');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      description: `${stats.totalUsers} kayıtlı kullanıcı`
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders.toString(),
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
      href: '/admin/users/new',
      color: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
    },
    {
      title: 'Program Oluştur',
      description: 'Yeni eğitim programı ekleyin',
      icon: BookOpen,
      href: '/admin/programs/new',
      color: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
    },
    {
      title: 'Blog Yazısı Yaz',
      description: 'Yeni blog içeriği oluşturun',
      icon: FileText,
      href: '/admin/blog/new',
      color: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
    },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: 'Tamamlandı', variant: 'default' as const, icon: CheckCircle },
      pending: { label: 'Bekliyor', variant: 'secondary' as const, icon: Clock },
      cancelled: { label: 'İptal', variant: 'destructive' as const, icon: XCircle },
      failed: { label: 'Başarısız', variant: 'destructive' as const, icon: XCircle },
      active: { label: 'Aktif', variant: 'default' as const, icon: CheckCircle },
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Genel Bakış</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sistem istatistikleri ve son aktiviteler</p>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${SHOW_ORDER_AMOUNTS ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={index} className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <TrendIcon className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{stat.description}</p>
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
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} text-white mb-4 transition-transform hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Son Siparişler</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">En son gelen siparişler</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="border-gray-300 dark:border-gray-700">
                <Link to="/admin/orders">Tümünü Gör</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">{order.order_number || order.id.slice(0, 8)}</p>
                        {getStatusBadge(order.payment_status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{order.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 truncate">{order.program_title}</p>
                    </div>
                    {SHOW_ORDER_AMOUNTS && (
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">₺{order.total_amount?.toLocaleString('tr-TR')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Henüz sipariş yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Yeni Kullanıcılar</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Son kayıt olan kullanıcılar</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="border-gray-300 dark:border-gray-700">
                <Link to="/admin/users">Tümünü Gör</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.full_name?.split(' ').map((n: string) => n[0]).join('') || user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">{user.full_name || user.email}</p>
                        {getStatusBadge('active')}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(user.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Henüz kullanıcı yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
