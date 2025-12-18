import { supabase } from './supabaseClient';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  plan_name: string;
  plan_slug: string;
  status: string;
  expires_at: string | null;
  features: string[];
}

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_subscription', {
      user_uuid: userId,
    });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Check if user has pro access
 */
export async function hasProAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_pro_access', {
      user_uuid: userId,
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Error checking pro access:', error);
    return false;
  }
}

/**
 * Activate subscription after payment
 */
export async function activateSubscription(
  userId: string,
  planSlug: string,
  paymentProvider: 'stripe' | 'paypal' | 'iyzico',
  externalSubscriptionId?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('activate_subscription', {
      user_uuid: userId,
      plan_slug: planSlug,
      payment_provider_name: paymentProvider,
      external_sub_id: externalSubscriptionId,
    });

    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error activating subscription:', error);
    return null;
  }
}

/**
 * Create payment transaction record
 */
export async function createPaymentTransaction(
  userId: string,
  subscriptionId: string | null,
  amount: number,
  currency: string,
  paymentMethod: string,
  paymentProvider: 'stripe' | 'paypal' | 'iyzico',
  externalTransactionId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending'
): Promise<void> {
  try {
    const { error } = await supabase.from('payment_transactions').insert({
      user_id: userId,
      subscription_id: subscriptionId,
      amount,
      currency,
      status,
      payment_method: paymentMethod,
      payment_provider: paymentProvider,
      external_transaction_id: externalTransactionId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
  }
}

/**
 * Update payment transaction status
 */
export async function updatePaymentStatus(
  externalTransactionId: string,
  status: 'completed' | 'failed' | 'refunded'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('external_transaction_id', externalTransactionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}
