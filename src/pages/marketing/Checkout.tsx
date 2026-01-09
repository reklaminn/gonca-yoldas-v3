import React, { useState, useEffect } from 'react';
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
  Loader2, CreditCard, Building2, ShieldCheck, Copy, User, ChevronRight,
  Shield, Zap, AlertCircle, ExternalLink, Plus, Calendar, Info
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { createOrder } from '@/services/orders';
import { getActivePaymentMethods, type PaymentMethod, type BankTransferConfig } from '@/services/paymentSettings';
import { isInvoiceEnabled, shouldShowPricesWithVAT } from '@/services/generalSettings';
import { sendPurchaseEvent, formatOrderForSendPulse } from '@/services/sendpulse';
import type { Program } from '@/hooks/usePrograms';
import { supabase } from '@/lib/supabaseClient';

// --- Helpers ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^5\d{9}$/.test(phone.replace(/\D/g, ''));
const validateTC = (tc: string) => /^[1-9][0-9]{10}$/.test(tc);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hızlı ve güvenilir REST fetch
const fetchProgramDirect = async (slug: string): Promise<Program | null> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/programs?slug=eq.${slug}&status=eq.active&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/vnd.pgrst.object+json'
        }
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    
    // Metadata parse
    if (data && typeof data.metadata === 'string') {
      data.metadata = JSON.parse(data.metadata);
    }
    
    return data;
  } catch (err) {
    console.error('❌ [Checkout] Program fetch hatası:', err);
    return null;
  }
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programSlug = searchParams.get('program');
  const dateParam = searchParams.get('date');
  const upsellIdsParam = searchParams.get('upsell_ids');

  const [program, setProgram] = useState<Program | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<any[]>([]);
  const [selectedDateInfo, setSelectedDateInfo] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // 🆕 Admin kontrolü
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card');
  const [invoiceSystemEnabled, setInvoiceSystemEnabled] = useState(true);
  const [showPricesWithVAT, setShowPricesWithVAT] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
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
    customFields: {} as Record<string, any>
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // --- Calculations ---
  const programPrice = program?.price || 0;
  const upsellsTotal = selectedUpsells.reduce((sum, item) => sum + (Number(item.discounted_price) || 0), 0);
  const baseTotal = programPrice + upsellsTotal;
  
  const taxRate = 20;
  let calcSubtotal = 0, calcTaxAmount = 0, calcTotal = 0;

  if (showPricesWithVAT) {
    calcTotal = baseTotal;
    const netPrice = calcTotal / (1 + taxRate / 100);
    calcSubtotal = netPrice;
    calcTaxAmount = calcTotal - netPrice;
  } else {
    calcSubtotal = baseTotal;
    calcTaxAmount = baseTotal * (taxRate / 100);
    calcTotal = baseTotal + calcTaxAmount;
  }

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Auth & Role Check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsAuthenticated(true);
          
          // 🔍 Profil çek ve admin kontrolü yap
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // 🆕 Admin kontrolü
          if (profile?.role === 'admin') {
            setIsAdmin(true);
            console.log('✅ [Checkout] Admin kullanıcı tespit edildi, profil doldurma atlanıyor');
            
            // Admin için sadece email'i doldur
            setFormData(prev => ({
              ...prev,
              email: session.user.email || prev.email
            }));
          } else {
            // 👤 Normal kullanıcı için profil bilgilerini doldur
            setFormData(prev => ({
              ...prev,
              email: session.user.email || prev.email,
              fullName: profile?.full_name || prev.fullName,
              phone: profile?.phone || prev.phone,
              city: profile?.city || prev.city,
              district: profile?.district || prev.district,
              billingAddress: profile?.full_address || prev.billingAddress,
              taxOffice: profile?.tax_office || prev.taxOffice,
              taxNumber: profile?.tax_number || prev.taxNumber,
              tcNo: profile?.tc_number || prev.tcNo,
              customerType: (profile?.billing_type as 'individual' | 'corporate') || 'individual'
            }));
          }
        }

        if (!programSlug) {
          navigate('/programs');
          return;
        }

        // 2. Program Fetch (Direkt REST)
        const prog = await fetchProgramDirect(programSlug);
        if (!prog) throw new Error('Program not found');
        
        setProgram(prog);

        // 3. Upsells
        if (upsellIdsParam && prog.metadata?.upsells) {
          const ids = upsellIdsParam.split(',');
          const foundUpsells = prog.metadata.upsells.filter((u: any) => 
            ids.includes(String(u.id))
          );
          setSelectedUpsells(foundUpsells);
        }

        // 4. Date
        if (dateParam && prog.metadata?.program_dates) {
          const foundDate = prog.metadata.program_dates.find((d: any) => String(d.id) === String(dateParam));
          if (foundDate) setSelectedDateInfo(foundDate);
        }

        // 5. Settings
        const methods = await getActivePaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedPaymentMethod(methods[0].payment_method);

        const [inv, vat] = await Promise.all([isInvoiceEnabled(), shouldShowPricesWithVAT()]);
        setInvoiceSystemEnabled(inv);
        setShowPricesWithVAT(vat);

      } catch (err) {
        console.error('Checkout init error:', err);
        toast.error('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [programSlug, navigate, upsellIdsParam, dateParam]);

  const validateField = (field: string, value: any): string => {
    // 🆕 Admin için validasyon atla
    if (isAdmin) {
      if (field === 'email') return !validateEmail(value) ? 'Geçerli bir e-posta girin' : '';
      if (field === 'kvkkConsent') return !value ? 'Onay gereklidir' : '';
      return ''; // Diğer alanlar admin için zorunlu değil
    }

    // Normal kullanıcı validasyonları
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

  const handleCustomFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: { ...prev.customFields, [fieldKey]: value }
    }));
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
    
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (key === 'customFields') return;
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
      const paymentStatus = selectedPaymentMethod === 'credit_card' ? 'completed' : 'pending';

      let orderDescription = `Program: ${program!.title}`;
      if (selectedDateInfo) {
        orderDescription += ` | Dönem: ${selectedDateInfo.title}`;
      }
      if (selectedUpsells.length > 0) {
        orderDescription += ` | Ek Paketler: ${selectedUpsells.map(u => u.title).join(', ')}`;
      }

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
        paymentStatus: paymentStatus,
        cardName: formData.cardName,
        cardLastFour: formData.cardNumber.replace(/\D/g, '').slice(-4),
        sendpulseSent: false,
        customFields: formData.customFields,
        metadata: {
          upsells: selectedUpsells,
          selectedDate: selectedDateInfo,
          description: orderDescription,
          customFields: formData.customFields
        }
      });

      if (orderId) {
        // --- SENDPULSE ID HAZIRLIĞI ---
        const selectedUpsellSendPulseIds = selectedUpsells
          .map(u => u.sendpulse_course_id)
          .filter(Boolean)
          .join(',');

        const mainProgramSendPulseId = program!.sendpulse_id;

        const sendPulseData = formatOrderForSendPulse(
          {
            ...formData,
            paymentStatus,
            paymentMethod: selectedPaymentMethod,
            orderId
          },
          {
            id: program!.id.toString(),
            slug: program!.slug,
            title: program!.title,
            price: program!.price,
            image: program!.image_url || '',
            sendpulse_id: mainProgramSendPulseId,
          },
          calcTotal,
          selectedUpsellSendPulseIds
        );

        try {
          const spResult = await sendPurchaseEvent(sendPulseData, orderId);
          if (!spResult.success) {
            console.warn('⚠️ SendPulse uyarısı:', spResult.error);
          }
        } catch (spError) {
          console.error('❌ SendPulse beklenmeyen hata:', spError);
        }

        if (selectedPaymentMethod === 'iyzilink' && program?.iyzilink) {
          window.location.href = `${program.iyzilink}?orderId=${orderId}`;
        } else {
          navigate('/tesekkurler?type=order');
        }
      }
    } catch (err: any) {
      console.error('Sipariş hatası:', err);
      toast.error(`Sipariş oluşturulurken bir hata oluştu: ${err.message}`);
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]"><Loader2 className="animate-spin text-[var(--color-primary)] h-12 w-12" /></div>;
  if (!program) return null;

  const bankConfig = paymentMethods.find(m => m.payment_method === 'bank_transfer')?.config as BankTransferConfig;
  const customFields = program.metadata?.custom_fields || [];

  return (
    <>
      <SEO title="Güvenli Ödeme" description="Siparişinizi tamamlayın" />
      
      <div className="min-h-screen py-12 bg-[var(--bg)]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto mb-10">
            <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)] mb-4">
              <span>Programlar</span>
              <ChevronRight className="h-4 w-4" />
              <span>{program.title}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[var(--color-primary)] font-medium">Ödeme</span>
            </div>
            <h1 className="text-3xl font-bold">Siparişi Tamamla</h1>
            
            {/* 🆕 Admin Uyarısı */}
            {isAdmin && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">Admin Görünümü</p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    Admin olarak checkout sayfasını görüntülüyorsunuz. Test siparişi oluşturabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
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
                        <Label>Ad Soyad {!isAdmin && '*'}</Label>
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
                          disabled={isAuthenticated}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon {!isAdmin && '*'}</Label>
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

                {/* CUSTOM FIELDS (Özel Alanlar) */}
                {customFields.length > 0 && (
                  <Card className="card bg-[var(--surface-1)] border-[var(--border)]">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 text-sm">
                          <Info className="h-4 w-4" />
                        </div>
                        Ek Bilgiler
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customFields.map((field: any) => (
                        <div key={field.key} className="space-y-2">
                          <Label>
                            {field.label}
                            {field.required && !isAdmin && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          
                          {field.type === 'text' && (
                            <Input
                              placeholder={field.placeholder || ''}
                              value={formData.customFields[field.key] || ''}
                              onChange={e => handleCustomFieldChange(field.key, e.target.value)}
                              required={field.required && !isAdmin}
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <Textarea
                              placeholder={field.placeholder || ''}
                              value={formData.customFields[field.key] || ''}
                              onChange={e => handleCustomFieldChange(field.key, e.target.value)}
                              required={field.required && !isAdmin}
                              rows={3}
                            />
                          )}
                          
                          {field.type === 'select' && (
                            <select
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--fg)]"
                              value={formData.customFields[field.key] || ''}
                              onChange={e => handleCustomFieldChange(field.key, e.target.value)}
                              required={field.required && !isAdmin}
                            >
                              <option value="">Seçiniz...</option>
                              {field.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                          
                          {field.type === 'checkbox' && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={formData.customFields[field.key] || false}
                                onCheckedChange={v => handleCustomFieldChange(field.key, v)}
                              />
                              <span className="text-sm">{field.placeholder}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

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
                          <Label>İl {!isAdmin && '*'}</Label>
                          <Input placeholder="Örn: İstanbul" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>İlçe {!isAdmin && '*'}</Label>
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
                            <Label>TC Kimlik Numarası {!isAdmin && '*'}</Label>
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
                                <Label>Vergi Dairesi {!isAdmin && '*'}</Label>
                                <Input placeholder="Beşiktaş V.D." value={formData.taxOffice} onChange={e => handleInputChange('taxOffice', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label>Vergi Numarası {!isAdmin && '*'}</Label>
                                <Input placeholder="10 haneli" value={formData.taxNumber} onChange={e => handleInputChange('taxNumber', e.target.value.replace(/\D/g, ''))} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Fatura Adresi {!isAdmin && '*'}</Label>
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
                              </div>
                            </motion.div>
                          )}

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
                              </div>
                            </motion.div>
                          )}

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

                    {selectedDateInfo && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Seçilen Dönem</p>
                          <p className="text-sm font-medium">{selectedDateInfo.title}</p>
                        </div>
                      </div>
                    )}

                    {selectedUpsells.map((upsell, idx) => (
                      <div key={idx} className="p-4 flex gap-3 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                          <Plus className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{upsell.title}</h4>
                          <p className="text-xs text-[var(--fg-muted)] line-clamp-1">{upsell.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-green-600">+₺{Number(upsell.discounted_price).toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 space-y-3">
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
    </>
  );
};

export default Checkout;
