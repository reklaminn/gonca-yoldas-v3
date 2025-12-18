import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, Loader2, Home, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<{
    programTitle: string;
    programSlug: string;
    totalAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW: Retry mechanism state
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // ✅ Race condition prevention
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ NEW: Retry with exponential backoff
  const retryWithBackoff = async (
    operation: () => Promise<any>,
    attempt: number = 0
  ): Promise<any> => {
    try {
      return await operation();
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`⏳ Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retryWithBackoff(operation, attempt + 1);
    }
  };

  // ✅ NEW: Process failure with retry support
  const processFailure = async (isManualRetry: boolean = false) => {
    console.log('🔴 PaymentFailure: Processing payment failure callback');
    console.log('🔴 Order ID from URL:', orderId);
    console.log('🔄 Is manual retry:', isManualRetry);

    // ✅ CRITICAL: Prevent multiple simultaneous executions
    if (processingRef.current) {
      console.log('⚠️ Already processing, skipping duplicate request');
      return;
    }

    // ✅ CRITICAL: Validate orderId
    if (!orderId) {
      console.error('❌ No orderId provided');
      setError('Sipariş numarası bulunamadı');
      setIsLoading(false);
      setIsRetrying(false);
      return;
    }

    // ✅ CRITICAL: Set processing flag
    processingRef.current = true;

    // ✅ CRITICAL: Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    try {
      // ✅ STEP 1: Fetch order details with retry
      console.log('🔍 Fetching order details...');
      
      const order = await retryWithBackoff(async () => {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .abortSignal(abortControllerRef.current!.signal)
          .single();

        if (fetchError) {
          console.error('❌ Error fetching order:', fetchError);
          throw new Error('Sipariş bulunamadı');
        }

        if (!data) {
          console.error('❌ Order not found');
          throw new Error('Sipariş bulunamadı');
        }

        return data;
      });

      console.log('✅ Order found:', order.order_number);
      console.log('📊 Current status:', order.status);
      console.log('💳 Payment status:', order.payment_status);

      // ✅ STEP 2: Set order details first (for display)
      setOrderDetails({
        programTitle: order.program_title,
        programSlug: order.program_slug,
        totalAmount: order.total_amount,
      });

      // ✅ STEP 3: Update order status to failed (only if not already completed)
      if (order.payment_status !== 'completed' && order.status !== 'completed') {
        console.log('🔄 Updating order status to failed...');
        
        await retryWithBackoff(async () => {
          const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ 
              status: 'failed',
              payment_status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('updated_at', order.updated_at) // ✅ Optimistic locking
            .select()
            .single();

          if (updateError) {
            // ✅ Check if it's a concurrent update conflict
            if (updateError.code === 'PGRST116') {
              console.warn('⚠️ Concurrent update detected - checking current status...');
              
              // ✅ Re-fetch to get current status
              const { data: currentOrder } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

              if (currentOrder?.payment_status === 'completed' || currentOrder?.status === 'completed') {
                console.log('⚠️ Order was completed by another request - not updating to failed');
                return currentOrder;
              }
              
              if (currentOrder?.status === 'failed') {
                console.log('✅ Order already marked as failed by another request');
                return currentOrder;
              }
            }
            
            throw new Error('Sipariş durumu güncellenemedi');
          }

          if (updatedOrder) {
            console.log('✅ Order status updated to failed');
            console.log('📊 New status:', updatedOrder.status);
            console.log('💳 New payment status:', updatedOrder.payment_status);
          }

          return updatedOrder;
        });
      } else {
        console.log('⚠️ Order already completed or failed, not updating');
      }

      toast.error('Ödeme işlemi başarısız oldu');
      setIsLoading(false);
      setIsRetrying(false);
      setError(null);
      
      if (isManualRetry) {
        setRetryCount(prev => prev + 1);
      }
      
    } catch (err: any) {
      // ✅ Ignore abort errors (component unmounted)
      if (err.name === 'AbortError') {
        console.log('⚠️ Request aborted (component unmounted)');
        return;
      }

      console.error('❌ Error processing failure:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      
      if (!isManualRetry) {
        toast.error(errorMessage);
      }
      
      setIsLoading(false);
      setIsRetrying(false);
    } finally {
      // ✅ CRITICAL: Reset processing flag
      processingRef.current = false;
    }
  };

  // ✅ Initial load
  useEffect(() => {
    processFailure(false);

    // ✅ CRITICAL: Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        console.log('🧹 Aborting pending requests...');
        abortControllerRef.current.abort();
      }
      processingRef.current = false;
    };
  }, [orderId]);

  // ✅ NEW: Manual retry handler
  const handleRetry = async () => {
    if (isRetrying || isLoading) {
      console.log('⚠️ Already retrying or loading');
      return;
    }

    if (retryCount >= MAX_RETRIES) {
      toast.error(`Maksimum deneme sayısına ulaşıldı (${MAX_RETRIES})`);
      return;
    }

    console.log('🔄 Manual retry initiated');
    setIsRetrying(true);
    setError(null);
    
    toast.info(`Tekrar deneniyor... (${retryCount + 1}/${MAX_RETRIES})`);
    
    await processFailure(true);
  };

  // Loading state
  if (isLoading && !isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>
            İşleniyor...
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--fg-muted)' }}>
            Lütfen sayfayı kapatmayın
          </p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                Bir Hata Oluştu
              </h2>
              <p className="mb-4" style={{ color: 'var(--fg-muted)' }}>
                {error}
              </p>

              {/* ✅ NEW: Retry counter */}
              {retryCount > 0 && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-1)' }}>
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    Deneme sayısı: <strong>{retryCount}/{MAX_RETRIES}</strong>
                  </p>
                </div>
              )}

              {/* ✅ NEW: Retry button */}
              <div className="flex gap-2 justify-center">
                {retryCount < MAX_RETRIES && (
                  <Button 
                    onClick={handleRetry} 
                    className="btn-primary"
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Tekrar Deneniyor...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tekrar Dene ({retryCount + 1}/{MAX_RETRIES})
                      </>
                    )}
                  </Button>
                )}
                
                <Button onClick={() => navigate('/')} className="btn-secondary">
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfaya Dön
                </Button>
              </div>

              {/* ✅ NEW: Max retries reached message */}
              {retryCount >= MAX_RETRIES && (
                <div className="mt-4 p-3 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Maksimum deneme sayısına ulaşıldı. Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failure state
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#ef4444' }}
        >
          <XCircle className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
          Ödeme Başarısız
        </h1>

        {/* ✅ NEW: Retry counter indicator */}
        {retryCount > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-1)' }}>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              {retryCount} kez denendi, başarısız oldu
            </p>
          </div>
        )}

        {orderDetails && (
          <>
            <p className="text-lg mb-2" style={{ color: 'var(--fg-muted)' }}>
              <strong>{orderDetails.programTitle}</strong> için ödeme işlemi tamamlanamadı.
            </p>

            <div className="mt-6 p-4 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950">
              <p className="text-sm text-red-700 dark:text-red-300">
                Ödeme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-1)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg)' }}>
                Sipariş Tutarı
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                ₺{orderDetails.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <Button
            onClick={() => navigate(`/siparis?program=${orderDetails?.programSlug}`)}
            className="btn-primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>

        <div className="mt-6">
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Sorun devam ederse{' '}
            <button
              onClick={() => navigate('/contact')}
              className="font-medium underline"
              style={{ color: 'var(--color-accent)' }}
            >
              bizimle iletişime geçin
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;
