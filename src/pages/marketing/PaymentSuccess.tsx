import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, Home, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    programTitle: string;
    totalAmount: number;
    email: string;
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

  // ✅ NEW: Process payment with retry support
  const processPayment = async (isManualRetry: boolean = false) => {
    console.log('🟢 PaymentSuccess: Processing payment callback');
    console.log('🟢 Order ID from URL:', orderId);
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

      // ✅ STEP 2: Check if already processed (IDEMPOTENCY)
      if (order.payment_status === 'completed' || order.status === 'completed') {
        console.log('⚠️ Order already processed - idempotent response');
        setOrderDetails({
          programTitle: order.program_title,
          totalAmount: order.total_amount,
          email: order.email,
        });
        setIsProcessed(true);
        setIsLoading(false);
        setIsRetrying(false);
        setError(null);
        
        if (isManualRetry) {
          toast.success('Sipariş zaten tamamlanmış');
        }
        
        return;
      }

      // ✅ STEP 3: Update order status with retry (ATOMIC OPERATION)
      console.log('🔄 Updating order status to completed...');
      
      const updatedOrder = await retryWithBackoff(async () => {
        const { data, error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            payment_status: 'paid',
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
              console.log('✅ Order already completed by another request');
              return currentOrder;
            }
          }
          
          throw new Error('Sipariş durumu güncellenemedi');
        }

        if (!data) {
          throw new Error('Sipariş güncellenemedi');
        }

        return data;
      });

      console.log('✅ Order status updated successfully');
      console.log('📊 New status:', updatedOrder.status);
      console.log('💳 New payment status:', updatedOrder.payment_status);

      // ✅ STEP 4: Set order details
      setOrderDetails({
        programTitle: updatedOrder.program_title,
        totalAmount: updatedOrder.total_amount,
        email: updatedOrder.email,
      });

      toast.success('Ödeme başarıyla tamamlandı!');
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

      console.error('❌ Error processing payment:', err);
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
    processPayment(false);

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
    
    await processPayment(true);
  };

  // Loading state
  if (isLoading && !isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>
            Ödemeniz işleniyor...
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

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
          Ödeme Başarılı!
        </h1>

        {isProcessed && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-accent-alpha)' }}>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              Bu ödeme daha önce işlenmiş
            </p>
          </div>
        )}

        {/* ✅ NEW: Retry success indicator */}
        {retryCount > 0 && (
          <div className="mb-4 p-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ {retryCount}. denemede başarılı oldu
            </p>
          </div>
        )}

        {orderDetails && (
          <>
            <p className="text-lg mb-2" style={{ color: 'var(--fg-muted)' }}>
              <strong>{orderDetails.programTitle}</strong> programına kayıt oldunuz.
            </p>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-1)' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                  Sipariş Detayları
                </p>
              </div>
              <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>
                E-posta: <strong>{orderDetails.email}</strong>
              </p>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                Tutar: <strong>₺{orderDetails.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-alpha)' }}>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                Sipariş onayı ve programa erişim bilgileri <strong>{orderDetails.email}</strong> adresinize gönderildi.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <Button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Panele Git
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
