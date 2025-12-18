import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Calendar,
  CreditCard,
  Package,
  FileText,
  Download,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  order_number: string;
  order_date: string;
  
  // Customer Info
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  postal_code: string;
  address: string;
  tax_office: string;
  tax_number: string;
  
  // Program Info
  program_id: number;
  program_slug: string;
  program_title: string;
  program_price: number;
  
  // Order Totals
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  
  // Payment Info
  payment_method: string;
  installment: number;
  coupon_code: string;
  payment_status: string;
  card_name: string;
  card_last_four: string;
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && orderId) {
      fetchOrderDetails();
    }
  }, [user, authLoading, orderId]);

  const fetchOrderDetails = async () => {
    if (!user || !orderId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast.error('Sipariş bulunamadı');
        navigate('/dashboard/orders');
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Sipariş detayları yüklenirken bir hata oluştu');
      navigate('/dashboard/orders');
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

  if (!order) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--fg)]">Sipariş Detayları</h1>
            <p className="text-[var(--fg-muted)] mt-1">{order.order_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.payment_status === 'completed' && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Fatura İndir
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.payment_status)}
                  <div>
                    <CardTitle className="text-[var(--fg)]">Sipariş Durumu</CardTitle>
                    <CardDescription className="text-[var(--fg-muted)]">
                      {new Date(order.order_date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(order.payment_status)}
              </div>
            </CardHeader>
          </Card>

          {/* Program Details */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Program Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--fg)] mb-1">{order.program_title}</h3>
                  <p className="text-sm text-[var(--fg-muted)]">Program ID: {order.program_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--fg)]">
                    ₺{order.program_price.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Ödeme Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[var(--fg-muted)]" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Ödeme Yöntemi</p>
                  <p className="font-medium text-[var(--fg)]">{getPaymentMethodText(order.payment_method)}</p>
                </div>
              </div>

              {order.card_last_four && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Kart Bilgisi</p>
                    <p className="font-medium text-[var(--fg)]">
                      {order.card_name} - **** {order.card_last_four}
                    </p>
                  </div>
                </div>
              )}

              {order.installment > 1 && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Taksit</p>
                    <p className="font-medium text-[var(--fg)]">{order.installment} Taksit</p>
                  </div>
                </div>
              )}

              {order.coupon_code && (
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Kupon Kodu</p>
                    <p className="font-medium text-[var(--fg)]">{order.coupon_code}</p>
                  </div>
                </div>
              )}

              <Separator className="bg-[var(--border)]" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--fg-muted)]">Ara Toplam</span>
                  <span className="text-[var(--fg)]">₺{order.subtotal.toLocaleString('tr-TR')}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--fg-muted)]">
                      İndirim ({order.discount_percentage}%)
                    </span>
                    <span className="text-green-500">
                      -₺{order.discount_amount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--fg-muted)]">KDV ({order.tax_rate}%)</span>
                  <span className="text-[var(--fg)]">₺{order.tax_amount.toLocaleString('tr-TR')}</span>
                </div>
                <Separator className="bg-[var(--border)]" />
                <div className="flex justify-between">
                  <span className="font-semibold text-[var(--fg)]">Toplam</span>
                  <span className="text-2xl font-bold text-[var(--fg)]">
                    ₺{order.total_amount.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[var(--fg-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Ad Soyad</p>
                  <p className="font-medium text-[var(--fg)]">{order.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[var(--fg-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">E-posta</p>
                  <p className="font-medium text-[var(--fg)]">{order.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[var(--fg-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--fg-muted)]">Telefon</p>
                  <p className="font-medium text-[var(--fg)]">{order.phone}</p>
                </div>
              </div>

              {order.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[var(--fg-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--fg-muted)]">Adres</p>
                    <p className="font-medium text-[var(--fg)]">
                      {order.address}
                      <br />
                      {order.district}, {order.city}
                      <br />
                      {order.postal_code && `${order.postal_code}, `}
                      {order.country}
                    </p>
                  </div>
                </div>
              )}

              {order.tax_number && (
                <>
                  <Separator className="bg-[var(--border)]" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--fg)]">Fatura Bilgileri</p>
                    <div className="text-sm text-[var(--fg-muted)]">
                      <p>Vergi Dairesi: {order.tax_office}</p>
                      <p>Vergi No: {order.tax_number}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-[var(--fg)]">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={`/programs/${order.program_slug}`}>
                  <Package className="h-4 w-4 mr-2" />
                  Programa Git
                </Link>
              </Button>
              {order.payment_status === 'completed' && (
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Faturayı Görüntüle
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Destek Talebi
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
