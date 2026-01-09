import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ShoppingBag, 
  Search, 
  Download,
  CheckCircle,
  Clock,
  XCircle,
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Loader2,
  Eye,
  Trash2,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const SHOW_ORDER_AMOUNTS = import.meta.env.VITE_SHOW_ORDER_AMOUNTS === 'true';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Order {
  id: string;
  order_number: string;
  order_date: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  program_title: string;
  total_amount: number;
  payment_status: string;
  status: string;
  payment_method: string;
  installment: number;
  city?: string;
  district?: string;
  customer_type?: string;
  tc_no?: string;
  tax_office?: string;
  tax_number?: string;
  billing_address?: string;
  card_name?: string;
  card_last_four?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { session } = useAuthStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    console.log('🔵 [AdminOrders] Fetching orders with direct fetch API...');
    
    try {
      setLoading(true);
      
      if (!session?.access_token) {
        console.error('❌ [AdminOrders] No access token available');
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      console.log('✅ [AdminOrders] Access token available, fetching...');

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AdminOrders] Fetch failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [AdminOrders] Orders fetched:', data.length);
      
      setOrders(data || []);
    } catch (error: any) {
      console.error('❌ [AdminOrders] Error fetching orders:', error);
      toast.error('Siparişler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, field: 'payment_status' | 'status') => {
    console.log(`🔵 [AdminOrders] Updating order ${orderId} ${field} to ${newStatus}`);
    
    try {
      setIsUpdating(true);
      
      if (!session?.access_token) {
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ [field]: newStatus }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AdminOrders] Update failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      console.log('✅ [AdminOrders] Order updated successfully');
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, [field]: newStatus } : o));
      toast.success('Sipariş durumu güncellendi');
    } catch (error: any) {
      console.error('❌ [AdminOrders] Update error:', error);
      toast.error('Güncelleme sırasında hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    console.log(`🔵 [AdminOrders] Deleting order ${orderId}`);
    
    try {
      setIsDeleting(true);
      
      if (!session?.access_token) {
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AdminOrders] Delete failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ [AdminOrders] Order deleted successfully from database');
      
      // State'i güncelle
      setOrders(orders.filter(o => o.id !== orderId));
      toast.success('Sipariş başarıyla silindi');
    } catch (error: any) {
      console.error('❌ [AdminOrders] Delete error:', error);
      toast.error('Sipariş silinirken hata oluştu: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string, variant: "default" | "outline" | "destructive" | "secondary", icon: any }> = {
      completed: { label: 'Tamamlandı', variant: 'default', icon: CheckCircle },
      pending: { label: 'Bekliyor', variant: 'outline', icon: Clock },
      failed: { label: 'Başarısız', variant: 'destructive', icon: XCircle },
      cancelled: { label: 'İptal Edildi', variant: 'destructive', icon: XCircle },
      refunded: { label: 'İade Edildi', variant: 'secondary', icon: RefreshCw },
    };

    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;
    
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      'credit_card': 'Kredi Kartı',
      'bank_transfer': 'Banka Havalesi',
      'iyzilink': 'Güvenli Ödeme',
    };
    return methods[method] || method;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = selectedStatus === 'all' || order.payment_status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--fg)]">Sipariş Yönetimi</h1>
          <p className="text-[var(--fg-muted)] mt-2">Tüm siparişleri görüntüleyin ve yönetin</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Dışa Aktar
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
              <Input
                placeholder="Sipariş ara (ID, müşteri adı, e-posta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'completed', 'pending', 'failed'].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(status)}
                  size="sm"
                  className="capitalize"
                >
                  {status === 'all' ? 'Tümü' : status === 'completed' ? 'Tamamlanan' : status === 'pending' ? 'Bekleyen' : 'Başarısız'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--fg)]">Sipariş Listesi ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] hover:border-[var(--color-primary-alpha)] transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  <ShoppingBag className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-[var(--fg)]">
                      {order.order_number || `#${order.id.slice(0, 8)}`}
                    </h3>
                    {getStatusBadge(order.payment_status)}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-[var(--fg-muted)]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="truncate font-medium text-[var(--fg)]">{order.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="truncate">{order.program_title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
                  {SHOW_ORDER_AMOUNTS && (
                    <div className="text-right mr-4">
                      <p className="text-xs text-[var(--fg-muted)]">Tutar</p>
                      <p className="font-bold text-[var(--fg)]">₺{order.total_amount?.toLocaleString('tr-TR')}</p>
                    </div>
                  )}

                  {/* Status Update Select */}
                  <Select 
                    defaultValue={order.payment_status} 
                    onValueChange={(val) => updateOrderStatus(order.id, val, 'payment_status')}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Bekliyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="failed">Başarısız</SelectItem>
                      <SelectItem value="cancelled">İptal</SelectItem>
                      <SelectItem value="refunded">İade</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Details Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Sipariş Detayları</DialogTitle>
                        <DialogDescription>
                          Sipariş No: {order.order_number || order.id}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="grid gap-6 py-4">
                          {/* Müşteri Bilgileri */}
                          <div className="space-y-3">
                            <h4 className="font-bold flex items-center gap-2 border-b pb-2">
                              <User className="h-4 w-4 text-[var(--color-primary)]" />
                              Müşteri Bilgileri
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-[var(--fg-muted)]">Ad Soyad</p>
                                <p className="font-medium">{selectedOrder.full_name}</p>
                              </div>
                              <div>
                                <p className="text-[var(--fg-muted)]">E-posta</p>
                                <p className="font-medium">{selectedOrder.email}</p>
                              </div>
                              <div>
                                <p className="text-[var(--fg-muted)]">Telefon</p>
                                <p className="font-medium">{selectedOrder.phone || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[var(--fg-muted)]">Müşteri Tipi</p>
                                <p className="font-medium capitalize">{selectedOrder.customer_type === 'corporate' ? 'Kurumsal' : 'Bireysel'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Fatura Bilgileri */}
                          <div className="space-y-3">
                            <h4 className="font-bold flex items-center gap-2 border-b pb-2">
                              <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                              Fatura & Adres
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="col-span-2">
                                <p className="text-[var(--fg-muted)]">Adres</p>
                                <p className="font-medium">{selectedOrder.billing_address || `${selectedOrder.district} / ${selectedOrder.city}` || '-'}</p>
                              </div>
                              {selectedOrder.customer_type === 'corporate' ? (
                                <>
                                  <div>
                                    <p className="text-[var(--fg-muted)]">Vergi Dairesi</p>
                                    <p className="font-medium">{selectedOrder.tax_office || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[var(--fg-muted)]">Vergi No</p>
                                    <p className="font-medium">{selectedOrder.tax_number || '-'}</p>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <p className="text-[var(--fg-muted)]">TC Kimlik No</p>
                                  <p className="font-medium">{selectedOrder.tc_no || '-'}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ödeme Bilgileri */}
                          <div className="space-y-3">
                            <h4 className="font-bold flex items-center gap-2 border-b pb-2">
                              <CreditCard className="h-4 w-4 text-[var(--color-primary)]" />
                              Ödeme Bilgileri
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-[var(--fg-muted)]">Yöntem</p>
                                <p className="font-medium">{formatPaymentMethod(selectedOrder.payment_method)}</p>
                              </div>
                              <div>
                                <p className="text-[var(--fg-muted)]">Taksit</p>
                                <p className="font-medium">{selectedOrder.installment > 1 ? `${selectedOrder.installment} Taksit` : 'Tek Çekim'}</p>
                              </div>
                              {selectedOrder.card_last_four && (
                                <div>
                                  <p className="text-[var(--fg-muted)]">Kart (Son 4 Hane)</p>
                                  <p className="font-medium">**** **** **** {selectedOrder.card_last_four}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Siparişi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve sipariş veritabanından kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteOrder(order.id)} 
                          className="bg-red-500 hover:bg-red-600"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Siliniyor...' : 'Sil'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-[var(--fg-muted)] mx-auto mb-4" />
                <p className="text-[var(--fg-muted)] text-lg">Sipariş bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
