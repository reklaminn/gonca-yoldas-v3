import { supabase } from '@/lib/supabaseClient';

export interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  payment_method: string;
  email: string;
  program_id?: string;
  program_title?: string;
  order_number?: string;
  metadata?: any;
  city?: string;
  district?: string;
  tax_office?: string;
  tax_number?: string;
  card_name?: string;
  card_last_four?: string;
  program_price?: number;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  installment?: number;
  coupon_code?: string;
  full_name?: string;
  phone?: string;
}

// UUID oluşturucu (Tarayıcı uyumlu)
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const createOrder = async (orderData: any) => {
  console.log('Creating order:', orderData);

  const { data: { user } } = await supabase.auth.getUser();

  // ID'yi burada oluşturuyoruz. Böylece veritabanından dönmesini beklememize gerek kalmıyor.
  // Bu, misafir kullanıcıların RLS (SELECT) hatası almasını engeller.
  const orderId = generateUUID();

  const dbData = {
    id: orderId, // ID'yi manuel atıyoruz
    program_id: orderData.programId,
    program_title: orderData.programTitle,
    program_slug: orderData.programSlug || '',
    program_price: orderData.programPrice || 0,
    
    // Müşteri Bilgileri
    full_name: orderData.fullName,
    email: orderData.email,
    phone: orderData.phone,
    
    // Adres ve Fatura
    address: orderData.billingAddress,
    city: orderData.city,
    district: orderData.district,
    tax_office: orderData.taxOffice,
    tax_number: orderData.taxNumber,
    
    // Ek Bilgiler
    customer_type: orderData.customerType,
    tc_no: orderData.tcNo,

    // Ödeme Detayları
    total_amount: orderData.totalAmount,
    subtotal: orderData.subtotal,
    tax_amount: orderData.taxAmount,
    payment_method: orderData.paymentMethod,
    payment_status: orderData.paymentStatus,
    installment: orderData.installment,
    
    // Kart Bilgileri
    card_name: orderData.cardName,
    card_last_four: orderData.cardLastFour,

    status: orderData.paymentStatus === 'completed' ? 'completed' : 'pending',
    metadata: orderData.metadata,
    user_id: user?.id || null
  };

  // .select() KULLANMIYORUZ.
  // Çünkü misafir kullanıcının eklediği satırı okuma (SELECT) yetkisi yok.
  // ID'yi zaten bildiğimiz için buna ihtiyacımız da yok.
  const { error } = await supabase
    .from('orders')
    .insert([dbData]);

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return orderId;
};

export const getUserOrders = async (email: string) => {
  console.log('Fetching orders for:', email);
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  
  return data || [];
};

export const linkGuestOrdersToUser = async (email: string, userId: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ user_id: userId })
    .eq('email', email)
    .is('user_id', null);

  if (error) {
    console.error('Error linking guest orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }

  return data as Order;
};
