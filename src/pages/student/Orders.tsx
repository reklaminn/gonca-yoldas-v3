import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Search,
  Calendar,
  CreditCard,
  Package,
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  id: string;
  order_number: string;
  order_date: string;
  program_title: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  installment: number;
}

export default function Orders() {
  const { user, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Beklemede</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Başarısız</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Kredi Kartı';
      case 'bank_transfer':
        return 'Banka Transferi';
      case 'cash':
        return 'Nakit';
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.program_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      label: 'Toplam Sipariş',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-primary)]/20'
    },
    {
      label: 'Tamamlanan',
      value: orders.filter(o => o.payment_status === 'completed').length,
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Bekleyen',
      value: orders.filter(o => o.payment_status === 'pending').length,
      icon: Calendar,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Toplam Tutar',
      value: `₺${orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString('tr-TR')}`,
      icon: CreditCard,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Siparişlerim</h1>
        <p className="text-[var(--fg-muted)] mt-2">Tüm sipariş ve ödeme geçmişiniz</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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

      {/* Search */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
            <Input
              placeholder="Sipariş numarası veya program adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-[var(--fg-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">
              {searchQuery ? 'Sipariş bulunamadı' : 'Henüz siparişiniz bulunmuyor'}
            </h3>
            <p className="text-[var(--fg-muted)] mb-6">
              {searchQuery 
                ? 'Arama kriterlerinize uygun sipariş bulunamadı'
                : 'Programlarımızı inceleyerek ilk siparişinizi oluşturabilirsiniz'
              }
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link to="/programs">Programları İncele</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-[var(--border)] bg-[var(--bg-card)] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[var(--fg)]">
                            {order.order_number}
                          </h3>
                          {getStatusBadge(order.payment_status)}
                        </div>
                        <p className="text-[var(--fg-muted)]">{order.program_title}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.order_date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                        <CreditCard className="h-4 w-4" />
                        <span>{getPaymentMethodText(order.payment_method)}</span>
                        {order.installment > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {order.installment} Taksit
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--fg-muted)]">Tutar:</span>
                        <span className="font-semibold text-[var(--fg)]">
                          ₺{order.total_amount.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" asChild>
                      <Link to={`/dashboard/orders/${order.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Detaylar
                      </Link>
                    </Button>
                    {order.payment_status === 'completed' && (
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Fatura
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
