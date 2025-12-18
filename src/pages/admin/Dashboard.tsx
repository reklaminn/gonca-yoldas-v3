import React from 'react';
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
  XCircle
} from 'lucide-react';

// Environment variable kontrolü
const SHOW_ORDER_AMOUNTS = import.meta.env.VITE_SHOW_ORDER_AMOUNTS === 'true';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      description: 'Bu ay 142 yeni kayıt'
    },
    {
      title: 'Aktif Programlar',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: BookOpen,
      color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
      description: '18 program yayında'
    },
    {
      title: 'Toplam Sipariş',
      value: '856',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
      description: 'Bu ay 67 sipariş'
    },
    // Gelir kartı sadece SHOW_ORDER_AMOUNTS true ise gösterilir
    ...(SHOW_ORDER_AMOUNTS ? [{
      title: 'Gelir',
      value: '₺284,500',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
      description: 'Bu ay ₺42,300'
    }] : []),
  ];

  const recentOrders = [
    {
      id: 'ORD-2025-156',
      customer: 'Ayşe Yılmaz',
      program: 'Baby English (0-2 Yaş)',
      amount: 2499,
      status: 'completed',
      date: '2 saat önce'
    },
    {
      id: 'ORD-2025-155',
      customer: 'Mehmet Demir',
      program: 'Smart Kids (5-10 Yaş)',
      amount: 4999,
      status: 'processing',
      date: '5 saat önce'
    },
    {
      id: 'ORD-2025-154',
      customer: 'Zeynep Kaya',
      program: 'Playful Learning (2-5 Yaş)',
      amount: 3499,
      status: 'completed',
      date: '1 gün önce'
    },
    {
      id: 'ORD-2025-153',
      customer: 'Ali Öztürk',
      program: 'Baby English (0-2 Yaş)',
      amount: 2499,
      status: 'cancelled',
      date: '1 gün önce'
    },
  ];

  const recentUsers = [
    {
      name: 'Elif Şahin',
      email: 'elif.sahin@example.com',
      joinDate: '15 Ocak 2025',
      status: 'active',
      courses: 2
    },
    {
      name: 'Can Yıldız',
      email: 'can.yildiz@example.com',
      joinDate: '14 Ocak 2025',
      status: 'active',
      courses: 1
    },
    {
      name: 'Selin Arslan',
      email: 'selin.arslan@example.com',
      joinDate: '13 Ocak 2025',
      status: 'active',
      courses: 3
    },
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

  const systemAlerts = [
    {
      type: 'warning',
      message: '3 sipariş ödeme bekliyor',
      time: '10 dakika önce',
      action: 'Görüntüle'
    },
    {
      type: 'info',
      message: 'Sistem güncellemesi mevcut',
      time: '2 saat önce',
      action: 'Detaylar'
    },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: 'Tamamlandı', variant: 'default' as const, icon: CheckCircle },
      processing: { label: 'İşleniyor', variant: 'secondary' as const, icon: Clock },
      cancelled: { label: 'İptal', variant: 'destructive' as const, icon: XCircle },
      active: { label: 'Aktif', variant: 'default' as const, icon: CheckCircle },
    };

    const statusConfig = config[status as keyof typeof config];
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Genel Bakış</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sistem istatistikleri ve son aktiviteler</p>
      </div>

      {/* Stats Grid - Dinamik sütun sayısı */}
      <div className={`grid ${SHOW_ORDER_AMOUNTS ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {stats.map((stat, index) => {
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
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">{order.id}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{order.customer}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate">{order.program}</p>
                  </div>
                  {SHOW_ORDER_AMOUNTS && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white mb-1">₺{order.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{order.date}</p>
                    </div>
                  )}
                  {!SHOW_ORDER_AMOUNTS && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-500">{order.date}</p>
                    </div>
                  )}
                </div>
              ))}
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
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{user.courses} kurs • {user.joinDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Sistem Bildirimleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900' 
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                }`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                      alert.type === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{alert.message}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.time}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4 flex-shrink-0 border-gray-300 dark:border-gray-700">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
