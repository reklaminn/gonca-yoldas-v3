import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw,
  DollarSign, Tag, Percent, MapPin, Building, Hash, User, Mail, Phone, Banknote, Info,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrderById, Order } from '@/services/orders';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Environment variable kontrolü
const SHOW_ORDER_AMOUNTS = import.meta.env.VITE_SHOW_ORDER_AMOUNTS === 'true';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError('Sipariş ID\'si bulunamadı.');
        setLoading(false);
        return;
      }
      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
        } else {
          setError('Sipariş bulunamadı.');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Sipariş detayları yüklenirken bir hata oluştu.');
        toast.error('Sipariş detayları yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

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
        <div className="h-8 w-64 bg-[var(--bg-surface)] rounded animate-pulse" />
        <div className="grid gap-4">
          <div className="h-64 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          <div className="h-48 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          <div className="h-32 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[var(--fg-error)]">
        <AlertCircle className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Hata</h2>
        <p className="text-lg">{error}</p>
        <Button onClick={() => navigate('/dashboard/orders')} className="mt-6">
          Siparişlere Geri Dön
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[var(--fg-muted)]">
        <Package className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sipariş Bulunamadı</h2>
        <p className="text-lg">Aradığınız sipariş mevcut değil veya erişim izniniz yok.</p>
        <Button onClick={() => navigate('/dashboard/orders')} className="mt-6">
          Siparişlere Geri Dön
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined) => {
    return amount !== undefined ? `${amount.toLocaleString('tr-TR')} ₺` : 'N/A';
  };

  const formatDate = (dateString: string | undefined) => {
    return dateString ? new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--fg)]">Sipariş Detayı</h1>
          <p className="text-[var(--fg-muted)] mt-2">
            Sipariş No: <span className="font-semibold">#{order.order_number || order.id?.slice(0, 8)}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/orders')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tüm Siparişlere Dön
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-[var(--fg)] flex items-center gap-2">
                  <Package className="h-6 w-6 text-[var(--color-primary)]" />
                  {order.program_title}
                </CardTitle>
                {getStatusBadge(order.status || order.payment_status)}
              </div>
              <CardDescription className="flex items-center gap-2 text-[var(--fg-muted)]">
                <Calendar className="h-4 w-4" />
                {formatDate(order.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {SHOW_ORDER_AMOUNTS && (
                <>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm text-[var(--fg-muted)]">Toplam Tutar</p>
                      <p className="font-semibold text-[var(--fg)]">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>
                  {order.program_price !== undefined && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-[var(--color-primary)]" />
                      <div>
                        <p className="text-sm text-[var(--fg-muted)]">Program Fiyatı</p>
                        <p className="font-semibold text-[var(--fg)]">{formatCurrency(order.program_price)}</p>
                      </div>
                    </div>
                  )}
                  {order.subtotal !== undefined && (
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-[var(--color-primary)]" />
                      <div>
                        <p className="text-sm text-[var(--fg-muted)]">Ara Toplam</p>
                        <p className="font-semibold text-[var(--fg)]">{formatCurrency(order.subtotal)}</p>
                      </div>
                    </div>
                  )}
                  {order.discount_amount !== undefined && order.discount_amount > 0 && (
                    <div className="flex items-center gap-3">
                      <Percent className="h-5 w-5 text-[var(--color-accent)]" />
                      <div>
                        <p className="text-sm text-[var(--fg-muted)]">İndirim Tutarı</p>
                        <p className="font-semibold text-[var(--fg)]">- {formatCurrency(order.discount_amount)}</p>
                      </div>
                    </div>
                  )}
                  {order.tax_amount !== undefined && order.tax_amount > 0 && (
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-[var(--color-primary)]" />
                      <div>
                        <p className="text-sm text-[var(--fg-muted)]">Vergi Tutarı</p>
                        <p className="font-semibold text-[var(--fg)]">{formatCurrency(order.tax_amount)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Ödeme Yöntemi</p>
                  <p className="font-semibold text-[var(--fg)]">{order.payment_method}</p>
                </div>
              </div>
              {order.installment !== undefined && order.installment > 1 && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Taksit Sayısı</p>
                    <p className="font-semibold text-[var(--fg)]">{order.installment}</p>
                  </div>
                </div>
              )}
              {order.coupon_code && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Kupon Kodu</p>
                    <p className="font-semibold text-[var(--fg)]">{order.coupon_code}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)] h-full">
            <CardHeader>
              <CardTitle className="text-[var(--fg)] flex items-center gap-2">
                <User className="h-6 w-6 text-[var(--color-primary)]" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[var(--fg-muted)]" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Ad Soyad</p>
                  <p className="font-semibold text-[var(--fg)]">{order.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[var(--fg-muted)]" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">E-posta</p>
                  <p className="font-semibold text-[var(--fg)]">{order.email}</p>
                </div>
              </div>
              {order.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Telefon</p>
                    <p className="font-semibold text-[var(--fg)]">{order.phone}</p>
                  </div>
                </div>
              )}
              {(order.city || order.district) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Adres</p>
                    <p className="font-semibold text-[var(--fg)]">
                      {order.district ? `${order.district}, ` : ''}{order.city}
                    </p>
                  </div>
                </div>
              )}
              {order.tax_office && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Vergi Dairesi</p>
                    <p className="font-semibold text-[var(--fg)]">{order.tax_office}</p>
                  </div>
                </div>
              )}
              {order.tax_number && (
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Vergi Numarası</p>
                    <p className="font-semibold text-[var(--fg)]">{order.tax_number}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader>
            <CardTitle className="text-[var(--fg)] flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-[var(--color-primary)]" />
              Ödeme Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[var(--fg-muted)]" />
              <div>
                <p className="text-sm text-[var(--fg-muted)]">Ödeme Durumu</p>
                <p className="font-semibold text-[var(--fg)]">{order.payment_status}</p>
              </div>
            </div>
            {order.card_name && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[var(--fg-muted)]" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Kart Üzerindeki İsim</p>
                  <p className="font-semibold text-[var(--fg)]">{order.card_name}</p>
                </div>
              </div>
            )}
            {order.card_last_four && (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-[var(--fg-muted)]" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Kart Son Dört Hane</p>
                  <p className="font-semibold text-[var(--fg)]">**** {order.card_last_four}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OrderDetails;
