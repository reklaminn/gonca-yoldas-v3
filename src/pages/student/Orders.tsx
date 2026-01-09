import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { getUserOrders, linkGuestOrdersToUser } from '@/services/orders';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function fetchOrders() {
      if (!user?.email) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        // 1. Önce misafir siparişlerini bu kullanıcıya bağlamayı dene
        // Bu, siparişlerin görünmemesi sorununu çözer (eğer email eşleşiyorsa)
        if (user.id) {
          await linkGuestOrdersToUser(user.email, user.id).catch(err => 
            console.warn('Sipariş bağlama hatası (önemsiz olabilir):', err)
          );
        }

        // 2. Siparişleri çek
        const data = await getUserOrders(user.email);

        
        if (mounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error('❌ [Orders] Siparişler çekilemedi:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
        <p className="text-gray-500 mt-2">
          Tüm sipariş geçmişinizi görüntüleyin
        </p>
      </motion.div>

      <div className="grid gap-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <CardTitle>{order.program_title || 'Eğitim Programı'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Sipariş No</p>
                      <p className="font-semibold">#{order.order_number || order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tutar</p>
                      <p className="font-semibold">{order.total_amount?.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                >
                  Detaylar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz sipariş yok
              </h3>
              <p className="text-gray-500 text-center mb-6">
                İlk siparişinizi vermek için programlarımıza göz atın
              </p>
              <Button onClick={() => navigate('/programs')}>
                Programları İncele
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Orders;
