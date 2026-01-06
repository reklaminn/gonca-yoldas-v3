import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  total_amount: number;
  payment_method: string;
  payment_status: string;
  program_title: string;
  program_slug: string;
  full_name: string;
  email: string;
  phone?: string;
  user_id?: string;
  city?: string;
  district?: string;
  customer_type: 'individual' | 'corporate';
  tc_no?: string;
  tax_office?: string;
  tax_number?: string;
  billing_address?: string;
  card_name?: string;
  card_last_four?: string;
  discount_amount?: number;
  tax_amount?: number;
  subtotal?: number;
  program_id?: string;
  program_price?: number;
  discount_percentage?: number;
  tax_rate?: number;
  installment?: number;
  coupon_code?: string;
  sendpulse_sent?: boolean;
  sendpulse_sent_at?: string;
  sendpulse_error?: string;
  metadata?: Record<string, any>;
}

export interface OrderData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  customerType: 'individual' | 'corporate';
  tcNo?: string;
  taxOffice?: string;
  taxNumber?: string;
  billingAddress?: string;
  programId: string;
  programSlug: string;
  programTitle: string;
  programPrice: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  installment: number;
  couponCode?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  cardName: string;
  cardLastFour: string;
  sendpulseSent: boolean;
  sendpulseSentAt?: string;
  sendpulseError?: string;
  customFields?: Record<string, any>;
  metadata?: Record<string, any>; // Metadata için genel alan
}

export async function createOrder(orderData: OrderData): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || null;

    // Custom fields ve diğer metadata'yı birleştir
    const finalMetadata = {
      ...orderData.customFields,
      ...orderData.metadata
    };

    const orderInsertData = {
      user_id: userId,
      full_name: orderData.fullName,
      email: orderData.email,
      phone: orderData.phone,
      city: orderData.city,
      district: orderData.district,
      customer_type: orderData.customerType,
      tc_no: orderData.tcNo || null,
      tax_office: orderData.taxOffice || null,
      tax_number: orderData.taxNumber || null,
      billing_address: orderData.billingAddress || null,
      program_id: orderData.programId,
      program_slug: orderData.programSlug,
      program_title: orderData.programTitle,
      program_price: orderData.programPrice,
      subtotal: orderData.subtotal,
      discount_percentage: orderData.discountPercentage,
      discount_amount: orderData.discountAmount,
      tax_rate: orderData.taxRate,
      tax_amount: orderData.taxAmount,
      total_amount: orderData.totalAmount,
      payment_method: orderData.paymentMethod,
      installment: orderData.installment,
      coupon_code: orderData.couponCode || null,
      payment_status: orderData.paymentStatus,
      status: orderData.paymentStatus === 'completed' ? 'completed' : 'pending',
      card_name: orderData.cardName,
      card_last_four: orderData.cardLastFour,
      sendpulse_sent: orderData.sendpulseSent,
      metadata: finalMetadata, 
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select('id')
      .single();

    if (error) throw error;
    return order.id;
  } catch (error: any) {
    console.error('Order creation error:', error);
    toast.error(`Sipariş hatası: ${error.message}`);
    return null;
  }
}

export async function linkGuestOrdersToUser(email: string, userId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ user_id: userId })
      .eq('email', email)
      .is('user_id', null);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function getUserOrders(email: string) {
  const { data } = await supabase.from('orders').select('*').eq('email', email).order('created_at', { ascending: false });
  return data || [];
}

export async function getAllOrders() {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getOrderById(orderId: string) {
  const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  return !error;
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  return !error;
}
