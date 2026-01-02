import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, Lock, CheckCircle2, CreditCard, Mail, Phone, MapPin, 
  Building2, ShieldCheck, Info, Copy, Check, User, ChevronRight,
  Shield, Zap, AlertCircle, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { createOrder } from '@/services/orders';
import { getActivePaymentMethods, type PaymentMethod, type BankTransferConfig } from '@/services/paymentSettings';
import { isInvoiceEnabled, shouldShowPricesWithVAT } from '@/services/generalSettings';
import { useAuthStore } from '@/store/authStore';
import type { Program } from '@/hooks/usePrograms';

// --- Helpers ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^5\d{9}$/.test(phone.replace(/\D/g, ''));
const validateTC = (tc: string) => /^[1-9][0-9]{10}$/.test(tc);

const Checkout: React.FC = () => {
  console.log('🛒 [Checkout] Component rendering...');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programSlug = searchParams.get('program');
  
  // ✅ FIX: Get user from Zustand, extract email from user object
  const { user } = useAuthStore();
  const userEmail = user?.email || '';

  console.log('🛒 [Checkout] Program slug from URL:', programSlug);
  console.log('🛒 [Checkout] Auth state:', { hasUser: !!user, userEmail });

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card');
  const [invoiceSystemEnabled, setInvoiceSystemEnabled] = useState(true);
  const [showPricesWithVAT, setShowPricesWithVAT] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: userEmail || '',
    phone: '',
    customerType: 'individual' as 'individual' | 'corporate',
    tcNo: '',
    city: '',
    district: '',
    taxOffice: '',
    taxNumber: '',
    billingAddress: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    installment: '1',
    kvkkConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // --- Calculations ---
  const basePrice = program?.price || 0;
  const taxRate = 20;
  let calcSubtotal = 0, calcTaxAmount = 0, calcTotal = 0;

  if (showPricesWithVAT) {
    const netPrice = basePrice / (1 + taxRate / 100);
    calcTaxAmount = basePrice - netPrice;
    calcSubtotal = netPrice;
    calcTotal = basePrice;
  } else {
    calcSubtotal = basePrice;
    calcTaxAmount = basePrice * (taxRate / 100);
    calcTotal = basePrice + calcTaxAmount;
  }

  useEffect(() => {
    console.log('🛒 [Checkout] useEffect triggered');
    
    const init = async () => {
      console.log('🛒 [Checkout] init() function started');
      
      try {
        console.log('🛒 [Checkout] Step 1: Starting initialization...');
        
        // ✅ FIX: Use userEmail from user object
        console.log('🛒 [Checkout] Step 2: Using user email from Zustand');
        if (userEmail) {
          setFormData(prev => ({ ...prev, email: userEmail }));
          console.log('🛒 [Checkout] User email set from Zustand:', userEmail);
        }

        console.log('🛒 [Checkout] Step 3: Checking program slug...');
        if (!programSlug) {
          console.warn('🛒 [Checkout] No program slug, redirecting to /programs');
          navigate('/programs');
          return;
        }

        console.log('🛒 [Checkout] Step 4: Fetching program:', programSlug);
        
        // Direct fetch to Supabase REST API
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🛒 [Checkout] Step 5: Supabase config:', { 
          url: supabaseUrl, 
          hasKey: !!supabaseKey 
        });
        
        const url = `${supabaseUrl}/rest/v1/programs?slug=eq.${encodeURIComponent(programSlug)}&status=eq.active`;
        
        console.log('🛒 [Checkout] Step 6: Fetching from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('🛒 [Checkout] Step 7: Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🛒 [Checkout] HTTP Error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('🛒 [Checkout] Step 8: Program data received:', data);
        
        if (!data || data.length === 0) {
          console.error('🛒 [Checkout] Program not found in response');
          throw new Error('Program not found');
        }
        
        const prog = data[0];
        console.log('🛒 [Checkout] Step 9: Program loaded:', prog.title);
        setProgram(prog);

        console.log('🛒 [Checkout] Step 10: Fetching payment methods...');
        const methods = await getActivePaymentMethods();
        console.log('🛒 [Checkout] Step 11: Payment methods received:', methods.length);
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].payment_method);
          console.log('🛒 [Checkout] Default payment method set:', methods[0].payment_method);
        }

        console.log('🛒 [Checkout] Step 12: Fetching settings...');
        const [inv, vat] = await Promise.all([isInvoiceEnabled(), shouldShowPricesWithVAT()]);
        console.log('🛒 [Checkout] Step 13: Settings received - Invoice:', inv, 'VAT:', vat);
        setInvoiceSystemEnabled(inv);
        setShowPricesWithVAT(vat);

        console.log('🛒 [Checkout] Step 14: Setting loading to false');
        setIsLoading(false);
        console.log('🛒 [Checkout] ✅ Initialization complete!');
      } catch (err) {
        console.error('🛒 [Checkout] ❌ Error in init():', err);
        console.error('🛒 [Checkout] Error stack:', err instanceof Error ? err.stack : 'No stack');
        toast.error('Veriler yüklenirken bir hata oluştu.');
        setIsLoading(false);
      }
    };
    
    console.log('🛒 [Checkout] About to call init()...');
    init();
    console.log('🛒 [Checkout] init() called (async, will continue in background)');
  }, [programSlug, navigate, userEmail]);

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'fullName': return !value.trim() ? 'Ad Soyad gereklidir' : '';
      case 'email': return !validateEmail(value) ? 'Geçerli bir e-posta girin' : '';
      case 'phone': return !validatePhone(value) ? 'Geçerli bir telefon girin' : '';
      case 'city': return invoiceSystemEnabled && !value.trim() ? 'İl seçimi zorunludur' : '';
      case 'district': return invoiceSystemEnabled && !value.trim() ? 'İlçe seçimi zorunludur' : '';
      case 'tcNo':
        if (invoiceSystemEnabled && formData.customerType === 'individual') {
          return !validateTC(value) ? 'Geçerli bir TC Kimlik No girin (11 hane)' : '';
        }
        return '';
      case 'taxOffice':
        if (invoiceSystemEnabled && formData.customerType === 'corporate') {
          return !value.trim() ? 'Vergi dairesi gereklidir' : '';
        }
        return '';
      case 'taxNumber':
        if (invoiceSystemEnabled && formData.customerType === 'corporate') {
          return !/^\d{10,11}$/.test(value) ? 'Geçerli bir vergi no girin' : '';
        }
        return '';
      case 'billingAddress':
        if (invoiceSystemEnabled && formData.customerType === 'corporate') {
          return !value.trim() ? 'Fatura adresi gereklidir' : '';
        }
        return '';
      case 'kvkkConsent': return !value ? 'Onay gereklidir' : '';
      default: return '';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field as keyof typeof formData]) }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key as keyof typeof formData]);
      if (err) newErrors[key] = err;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((a, b) => ({ ...a, [b]: true }), {}));
      toast.error('Lütfen eksik alanları doldurun.');
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = await createOrder({
        ...formData,
        programId: program!.id.toString(),
        programSlug: program!.slug,
        programTitle: program!.title,
        programPrice: program!.price,
        subtotal: calcSubtotal,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate,
        taxAmount: calcTaxAmount,
        totalAmount: calcTotal,
        paymentMethod: selectedPaymentMethod,
        installment: parseInt(formData.installment),
        paymentStatus: selectedPaymentMethod === 'credit_card' ? 'completed' : 'pending',
        cardName: formData.cardName,
        cardLastFour: formData.cardNumber.replace(/\D/g, '').slice(-4),
        sendpulseSent: false
      });

      if (orderId) {
        if (selectedPaymentMethod === 'iyzilink' && program?.iyzilink) {
          window.location.href = `${program.iyzilink}?orderId=${orderId}`;
        } else {
          setShowSuccess(true);
        }
      }
    } catch (err) {
      toast.error('Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  console.log('🛒 [Checkout] Render state:', { isLoading, hasProgram: !!program, programSlug });

  if (isLoading) {
    console.log('🛒 [Checkout] Showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (!program) {
    console.log('🛒 [Checkout] No program found, returning null');
    return null;
  }

  console.log('🛒 [Checkout] Rendering checkout form...');

  const bankConfig = paymentMethods.find(m => m.payment_method === 'bank_transfer')?.config as BankTransferConfig;

  return (
    <>
      <SEO title="Güvenli Ödeme" description="Siparişinizi tamamlayın" />
      
      <div className="min-h-screen py-12 bg-[var(--bg)]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-10">
            <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)] mb-4">
              <span>Programlar</span>
              <ChevronRight className="h-4 w-4" />
              <span>{program.title}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[var(--color-primary)] font-medium">Ödeme</span>
            </div>
            <h1 className="text-3xl font-bold">Siparişi Tamamla</h1>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Sol Kolon: Formlar */}
            <div className="lg:col-span-2 space-y-6">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Kişisel Bilgiler */}
                <Card className="card bg-[var(--surface-1)] border-[var(--border)]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-alpha)] flex items-center justify-center text-[var(--color-primary)] text-sm">1</div>
                      Kişisel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ad Soyad *</Label>
                        <Input 
                          placeholder="John Doe"
                          value={formData.fullName} 
                          onChange={e => handleInputChange('fullName', e.target.value)} 
                          onBlur={() => handleBlur('fullName')}
                          className={errors.fullName && touched.fullName ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-posta *</Label>
                        <Input 
                          type="email"
                          placeholder="ornek@mail.com"
                          value={formData.email} 
                          onChange={e => handleInputChange('email', e.target.value)} 
                          disabled={!!userEmail}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] text-sm">+90</span>
                        <Input 
                          className="pl-12"
                          placeholder="5XX XXX XX XX"
                          value={formData.phone} 
                          onChange={e => handleInputChange('phone', e.target.value.replace(/\D/g, ''))} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Fatura Bilgileri */}
                {invoiceSystemEnabled && (
                  <Card className="card bg-[var(--surface-1)] border-[var(--border)] overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-alpha)] flex items-center justify-center text-[var(--color-primary)] text-sm">2</div>
                        Fatura Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-1 bg-[var(--hover-overlay)] rounded-xl flex w-full">
                        <button
                          type="button"
                          onClick={() => handleInputChange('customerType', 'individual')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.customerType === 'individual' ? 'bg-[var(--surface-1)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--fg-muted)]'}`}
                        >
                          <User className="h-4 w-4" /> Bireysel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('customerType', 'corporate')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.customerType === 'corporate' ? 'bg-[var(--surface-1)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--fg-muted)]'}`}
                        >
                          <Building2 className="h-4 w-4" /> Kurumsal
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>İl *</Label>
                          <Input placeholder="Örn: İstanbul" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>İlçe *</Label>
                          <Input placeholder="Örn: Kadıköy" value={formData.district} onChange={e => handleInputChange('district', e.target.value)} />
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {formData.customerType === 'individual' ? (
                          <motion.div
                            key="ind"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <Label>TC Kimlik Numarası *</Label>
                            <Input 
                              maxLength={11}
                              placeholder="11 haneli TC No"
                              value={formData.tcNo}
                              onChange={e => handleInputChange('tcNo', e.target.value.replace(/\D/g, ''))}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="corp"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Vergi Dairesi *</Label>
                                <Input placeholder="Beşiktaş V.D." value={formData.taxOffice} onChange={e => handleInputChange('taxOffice', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label>Vergi Numarası *</Label>
                                <Input placeholder="10 haneli" value={formData.taxNumber} onChange={e => handleInputChange('taxNumber', e.target.value.replace(/\D/g, ''))} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Fatura Adresi *</Label>
                              <Textarea placeholder="Şirket tam adresi..." value={formData.billingAddress} onChange={e => handleInputChange('billingAddress', e.target.value)} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Ödeme Yöntemi */}
                <Card className="card bg-[var(--surface-1)] border-[var(--border)]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-alpha)] flex items-center justify-center text-[var(--color-primary)] text-sm">3</div>
                      Ödeme Yöntemi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="grid gap-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id}>
                          <Label
                            htmlFor={method.payment_method}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedPaymentMethod === method.payment_method 
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-alpha)]' 
                                : 'border-[var(--border)] hover:border-[var(--fg-muted)]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={method.payment_method} id={method.payment_method} />
                              <div className="flex items-center gap-2">
                                {method.payment_method === 'credit_card' && <CreditCard className="h-5 w-5" />}
                                {method.payment_method === 'bank_transfer' && <Building2 className="h-5 w-5" />}
                                {method.payment_method === 'iyzilink' && <Zap className="h-5 w-5" />}
                                <span className="font-medium">
                                  {method.payment_method === 'credit_card' ? 'Kredi Kartı' : 
                                   method.payment_method === 'bank_transfer' ? 'Havale / EFT' : 'Güvenli Ödeme Sayfası'}
                                </span>
                              </div>
                            </div>
                          </Label>

                          {/* Havale Bilgileri Paneli */}
                          {selectedPaymentMethod === 'bank_transfer' && method.payment_method === 'bank_transfer' && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 space-y-6"
                            >
                              <div className="p-6 rounded-xl bg-[var(--hover-overlay)] border border-[var(--border)] space-y-4">
                                <div className="grid gap-3">
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                    <div>
                                      <p className="text-xs text-[var(--fg-muted)]">Banka</p>
                                      <p className="font-medium">{bankConfig?.bank_name}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                    <div className="flex-1">
                                      <p className="text-xs text-[var(--fg-muted)]">Alıcı</p>
                                      <p className="font-medium">{bankConfig?.account_holder}</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => copyToClipboard(bankConfig?.account_holder || '', 'Alıcı adı')}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                    <div className="flex-1">
                                      <p className="text-xs text-[var(--fg-muted)]">IBAN</p>
                                      <p className="font-medium font-mono">{bankConfig?.iban}</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => copyToClipboard(bankConfig?.iban || '', 'IBAN')}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary-alpha)] flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertCircle className="h-4 w-4 text-[var(--color-primary)]" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-lg">Önemli Bilgi</h4>
                                    <p className="text-[var(--fg-muted)] text-sm leading-relaxed">
                                      Ödeme dekontunuz tarafımıza ulaştıktan sonra, size eğitimle ilgili ayrıca Eğitim linki ve detayları ile ilgili bir onay maili gönderilecektir.
                                    </p>
                                  </div>
                                </div>

                                <div className="p-5 rounded-2xl border-2 border-[var(--color-primary-alpha)] bg-[var(--color-primary-alpha)]/5">
                                  <p className="text-center font-medium text-sm md:text-base">
                                    Havale yaptıktan sonra siparişiniz onaylanacak ve programa erişim sağlanacaktır.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Güvenli Ödeme Sayfası (Iyzilink) Bilgileri */}
                          {selectedPaymentMethod === 'iyzilink' && method.payment_method === 'iyzilink' && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 space-y-6"
                            >
                              <div className="flex items-center gap-3">
                                <ExternalLink className="h-6 w-6 text-[var(--color-primary)]" />
                                <h3 className="text-2xl font-bold">Güvenli Ödeme Sayfası</h3>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary-alpha)] flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertCircle className="h-4 w-4 text-[var(--color-primary)]" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-lg">Ödeme Bilgisi</h4>
                                    <p className="text-[var(--fg-muted)] text-sm leading-relaxed">
                                      Ödeme işlemini tamamlamak için güvenli ödeme sayfasına yönlendirileceksiniz.
                                    </p>
                                  </div>
                                </div>

                                <div className="p-5 rounded-2xl border-2 border-[var(--color-primary-alpha)] bg-[var(--color-primary-alpha)]/5">
                                  <p className="text-center font-medium text-sm md:text-base">
                                    Sipariş oluşturduktan sonra güvenli ödeme sayfasına yönlendirileceksiniz.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Kredi Kartı Formu */}
                          {selectedPaymentMethod === 'credit_card' && method.payment_method === 'credit_card' && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 space-y-4 p-4 border border-[var(--border)] rounded-xl"
                            >
                              <div className="space-y-2">
                                <Label>Kart Üzerindeki İsim</Label>
                                <Input placeholder="JOHN DOE" value={formData.cardName} onChange={e => handleInputChange('cardName', e.target.value.toUpperCase())} />
                              </div>
                              <div className="space-y-2">
                                <Label>Kart Numarası</Label>
                                <Input placeholder="0000 0000 0000 0000" maxLength={19} value={formData.cardNumber} onChange={e => handleInputChange('cardNumber', e.target.value.replace(/\D/g, ''))} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Son Kullanma</Label>
                                  <Input placeholder="AA/YY" maxLength={5} value={formData.expiryDate} onChange={e => handleInputChange('expiryDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>CVC</Label>
                                  <Input placeholder="000" maxLength={3} value={formData.cvc} onChange={e => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Onaylar */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-primary-alpha)] border border-[var(--color-primary-alpha)]">
                  <Checkbox 
                    id="kvkk" 
                    checked={formData.kvkkConsent} 
                    onCheckedChange={v => handleInputChange('kvkkConsent', v)} 
                  />
                  <Label htmlFor="kvkk" className="text-sm leading-relaxed cursor-pointer">
                    <span className="font-medium text-[var(--color-primary)]">Mesafeli Satış Sözleşmesi</span>'ni ve 
                    <span className="font-medium text-[var(--color-primary)]"> KVKK Aydınlatma Metni</span>'ni okudum, onaylıyorum. *
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="btn-primary w-full h-14 text-lg font-bold shadow-lg shadow-[var(--color-primary-alpha)]"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="mr-2 h-5 w-5" />
                  )}
                  {selectedPaymentMethod === 'bank_transfer' ? 'Siparişi Onayla' : 
                   selectedPaymentMethod === 'iyzilink' ? 'Siparişi Oluştur ve Öde' : 'Güvenli Ödeme Yap'}
                </Button>
              </form>
            </div>

            {/* Sağ Kolon: Sepet Özeti */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="card bg-[var(--surface-1)] border-[var(--border)] overflow-hidden">
                  <CardHeader className="border-b border-[var(--border)] bg-[var(--hover-overlay)]">
                    <CardTitle className="text-lg">Sipariş Özeti</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 flex gap-4 border-b border-[var(--border)]">
                      <div className="w-20 h-20 rounded-lg bg-[var(--surface-2)] overflow-hidden shrink-0">
                        {program.image_url ? (
                          <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--fg-muted)]">
                            <Zap className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight mb-1">{program.title}</h3>
                        <p className="text-xs text-[var(--fg-muted)]">{program.age_range} Yaş • {program.duration}</p>
                        <p className="text-[var(--color-primary)] font-bold mt-1">₺{program.price.toLocaleString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--fg-muted)]">Ara Toplam</span>
                        <span>₺{calcSubtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--fg-muted)]">KDV (%{taxRate})</span>
                        <span>₺{calcTaxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-3 border-t border-[var(--border)] flex justify-between items-end">
                        <span className="font-bold">Toplam</span>
                        <div className="text-right">
                          <span className="block text-2xl font-black text-[var(--color-primary)]">
                            ₺{calcTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
                    <Shield className="h-10 w-10 text-green-500/50" />
                    <div>
                      <p className="text-sm font-bold">256-bit SSL Güvenliği</p>
                      <p className="text-xs text-[var(--fg-muted)]">Ödemeniz uçtan uca şifrelenir.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Başarı Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full"
            >
              <Card className="text-center p-8 border-[var(--color-primary)] shadow-2xl shadow-[var(--color-primary-alpha)]">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Siparişiniz Alındı!</h2>
                <p className="text-[var(--fg-muted)] mb-8">
                  {selectedPaymentMethod === 'bank_transfer' 
                    ? 'Ödemeniz onaylandıktan sonra eğitiminiz aktif edilecektir. Detaylar e-posta adresinize gönderildi.'
                    : 'Eğitiminiz başarıyla tanımlandı. Hemen öğrenmeye başlayabilirsiniz.'}
                </p>
                <Button onClick={() => navigate('/dashboard')} className="btn-primary w-full h-12">
                  Öğrenci Paneline Git
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Checkout;
