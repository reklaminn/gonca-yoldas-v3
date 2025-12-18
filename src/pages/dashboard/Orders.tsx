import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/services/orders';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// Environment variable kontrolü
const SHOW_ORDER_AMOUNTS = import.meta.env.VITE_SHOW_ORDER_AMOUNTS === 'true';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      if (user?.email) {
        try {
          const data = await getUserOrders(user.email);
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            İptal Edildi
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">
            <RefreshCw className="h-3 w-3 mr-1" />
            İade Edildi
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Başarısız
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[var(--bg-surface)] rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[var(--fg)]">Siparişlerim</h1>
        <p className="text-[var(--fg-muted)] mt-2">
          Tüm sipariş geçmişinizi görüntüleyin
        </p>
      </motion.div>

      {/* Orders List */}
      <div className="grid gap-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-[var(--border)] bg-[var(--bg-card)] hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-[var(--fg)]">{order.program_title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-[var(--fg-muted)]">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status || order.payment_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`grid grid-cols-1 ${SHOW_ORDER_AMOUNTS ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm text-[var(--fg-muted)]">Sipariş No</p>
                      <p className="font-semibold text-[var(--fg)]">#{order.order_number || order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm text-[var(--fg-muted)]">Ödeme Yöntemi</p>
                      <p className="font-semibold text-[var(--fg)]">{order.payment_method}</p>
                    </div>
                  </div>
                  {SHOW_ORDER_AMOUNTS && (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 flex items-center justify-center text-[var(--color-primary)] font-bold">₺</div>
                      <div>
                        <p className="text-sm text-[var(--fg-muted)]">Tutar</p>
                        <p className="font-semibold text-[var(--fg)]">{order.total_amount?.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] border-[var(--color-primary)] hover:border-[var(--color-primary-dark)]"
                >
                  Detayları Görüntüle
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-[var(--fg-muted)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--fg)] mb-2">
                Henüz sipariş yok
              </h3>
              <p className="text-[var(--fg-muted)] text-center">
                İlk siparişinizi vermek için programlarımıza göz atın
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Orders;
