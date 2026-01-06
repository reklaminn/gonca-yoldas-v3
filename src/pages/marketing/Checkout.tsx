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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, ShieldCheck, CreditCard, Building2, Copy, 
  ChevronRight, AlertCircle, ExternalLink, Package, Shield, Zap, User,
  FileText, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { createOrder, type OrderData } from '@/services/orders';
import { getActivePaymentMethods, type PaymentMethod, type BankTransferConfig } from '@/services/paymentSettings';
import { isInvoiceEnabled, shouldShowPricesWithVAT } from '@/services/generalSettings';
import { useAuthStore } from '@/store/authStore';
import type { Program } from '@/hooks/usePrograms';
import { supabase } from '@/lib/supabaseClient';

// --- Helpers ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^5\d{9}$/.test(phone.replace(/\D/g, ''));
const validateTC = (tc: string) => /^[1-9][0-9]{10}$/.test(tc);

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string; // Comma separated string
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programSlug = searchParams.get('program');
  const optionId = searchParams.get('option');
  const dateId = searchParams.get('date'); // URL'den tarihi al
  
  const { user } = useAuthStore();
  const userEmail = user?.email || '';

  const [program, setProgram] = useState<Program | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null); // Seçilen tarih objesi
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card');
  const [invoiceSystemEnabled, setInvoiceSystemEnabled] = useState(true);
  const [showPricesWithVAT, setShowPricesWithVAT] = useState(true);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

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

  // State for custom field answers
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // --- Calculations ---
  const basePrice = selectedPackage ? Number(selectedPackage.price) : (program?.price || 0);
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
    const init = async () => {
      try {
        if (userEmail) {
          setFormData(prev => ({ ...prev, email: userEmail }));
        }

        if (!programSlug) {
          navigate('/programs');
          return;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const url = `${supabaseUrl}/rest/v1/programs?slug=eq.${encodeURIComponent(programSlug)}&status=eq.active`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (!data || data.length === 0) throw new Error('Program not found');
        
        const prog = data[0];
        setProgram(prog);

        // Parse custom fields from metadata
        if (prog.metadata?.custom_fields && Array.isArray(prog.metadata.custom_fields)) {
          setCustomFields(prog.metadata.custom_fields);
          const initialValues: Record<string, any> = {};
          prog.metadata.custom_fields.forEach((field: CustomField) => {
            if (field.type === 'checkbox') {
              initialValues[field.id] = false;
            }
          });
          setCustomFieldValues(initialValues);
        }

        // Paket seçimi
        if (optionId && prog.metadata?.pricing_options) {
          const foundPackage = prog.metadata.pricing_options.find((opt: any) => opt.id === optionId);
          if (foundPackage) {
            setSelectedPackage(foundPackage);
          }
        }

        // Tarih seçimi
        if (dateId && prog.metadata?.program_dates) {
          const foundDate = prog.metadata.program_dates.find((d: any) => d.id === dateId);
          if (foundDate) {
            setSelectedDate(foundDate);
          }
        }

        const methods = await getActivePaymentMethods();
        const sortOrder = ['credit_card', 'bank_transfer', 'iyzilink'];
        methods.sort((a, b) => {
          const indexA = sortOrder.indexOf(a.payment_method);
          const indexB = sortOrder.indexOf(b.payment_method);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].payment_method);
        }

        const [inv, vat] = await Promise.all([isInvoiceEnabled(), shouldShowPricesWithVAT()]);
        setInvoiceSystemEnabled(inv);
        setShowPricesWithVAT(vat);

        setIsLoading(false);
      } catch (err) {
        console.error('Error in init():', err);
        toast.error('Veriler yüklenirken bir hata oluştu.');
        setIsLoading(false);
      }
    };
    
    init();
  }, [programSlug, optionId, dateId, navigate, userEmail]);

  const validateField = (field: string, value: any): string => {
    const customField = customFields.find(f => f.id === field);
    if (customField) {
      if (customField.required) {
        if (customField.type === 'checkbox') {
          return !value ? 'Bu alanın onaylanması zorunludur' : '';
        }
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Bu alan zorunludur';
        }
      }
      return '';
    }

    switch (field) {
      case 'fullName': return !value.trim() ? 'Ad Soyad gereklidir' : '';
      case 'email': return !validateEmail(value) ? 'Geçerli bir e-posta girin' : '';
      case 'phone': return !validatePhone(value) ? 'Geçerli bir telefon girin (5XX...)' : '';
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
      
      case 'cardName':
        if (selectedPaymentMethod === 'credit_card') return !value.trim() ? 'Kart üzerindeki isim gereklidir' : '';
        return '';
      case 'cardNumber':
        if (selectedPaymentMethod === 'credit_card') return value.length < 16 ? 'Geçerli bir kart numarası girin' : '';
        return '';
      case 'expiryDate':
        if (selectedPaymentMethod === 'credit_card') return value.length < 5 ? 'Geçerli bir tarih girin (AA/YY)' : '';
        return '';
      case 'cvc':
        if (selectedPaymentMethod === 'credit_card') return value.length < 3 ? 'CVC gereklidir' : '';
        return '';
        
      default: return '';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
    if (touched[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: validateField(fieldId, value) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const isCustom = customFields.some(f => f.id === field);
    const value = isCustom ? customFieldValues[field] : formData[field as keyof typeof formData];
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı`);
  };

  const checkCheckoutRateLimit = () => {
    const STORAGE_KEY = 'checkout_attempts';
    const MAX_ATTEMPTS = 5;
    const TIME_WINDOW = 10 * 60 * 1000;

    try {
      const attempts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const now = Date.now();
      const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < TIME_WINDOW);
      
      if (recentAttempts.length >= MAX_ATTEMPTS) {
        return false;
      }

      recentAttempts.push(now);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentAttempts));
      return true;
    } catch {
      return true;
    }
  };

  const triggerSendPulseEvent = async (orderData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        email: orderData.email,
        phone: orderData.phone,
        event_name: 'purchase',
        variables: {
          program_title: orderData.programTitle,
          program_date: selectedDate?.title || '', // SendPulse'a tarih bilgisini gönder
          order_id: orderData.id,
          amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          full_name: orderData.fullName
        }
      };

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-purchase-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('SendPulse trigger error:', error);
      // Hata olsa bile kullanıcıya hissettirme, arka planda logla
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkCheckoutRateLimit()) {
      toast.error('Çok fazla ödeme denemesi yaptınız. Lütfen güvenliğiniz için 10 dakika bekleyin.');
      return;
    }

    if (isProcessing) return;

    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key as keyof typeof formData]);
      if (err) newErrors[key] = err;
    });

    customFields.forEach(field => {
      const err = validateField(field.id, customFieldValues[field.id]);
      if (err) newErrors[field.id] = err;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const allTouched = { ...touched };
      Object.keys(formData).forEach(k => allTouched[k] = true);
      customFields.forEach(f => allTouched[f.id] = true);
      setTouched(allTouched);
      
      const firstErrorField = document.querySelector('[data-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      toast.error('Lütfen eksik alanları doldurun.');
      return;
    }

    setIsProcessing(true);
    try {
      const finalProgramTitle = selectedPackage 
        ? `${program!.title} - ${selectedPackage.title}`
        : program!.title;

      const customFieldsData: Record<string, any> = {};
      customFields.forEach(field => {
        customFieldsData[field.label] = customFieldValues[field.id];
      });

      // Tarih bilgisini metadata'ya ekle
      const metadata = {
        program_date_id: selectedDate?.id,
        program_date_title: selectedDate?.title,
        ...customFieldsData
      };

      // Explicitly type paymentStatus to match OrderData interface
      const paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 
        selectedPaymentMethod === 'credit_card' ? 'completed' : 'pending';

      const orderData: OrderData = {
        ...formData,
        programId: program!.id.toString(),
        programSlug: program!.slug,
        programTitle: finalProgramTitle,
        programPrice: basePrice,
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
        customFields: customFieldsData,
        metadata: metadata // Metadata'yı gönder
      };

      const orderId = await createOrder(orderData);

      if (orderId) {
        // SendPulse'a veri gönder
        await triggerSendPulseEvent({ ...orderData, id: orderId });

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

  const renderError = (field: string) => {
    if (touched[field] && errors[field]) {
      return (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-1 font-medium flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {errors[field]}
        </motion.p>
      );
    }
    return null;
  };

  const renderCustomField = (field: CustomField) => {
    const isError = !!(errors[field.id] && touched[field.id]);
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              placeholder={field.placeholder}
              value={customFieldValues[field.id] || ''}
              onChange={e => handleCustomFieldChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field.id)}
              className={isError ? 'border-red-500' : ''}
              data-invalid={isError}
            />
            {renderError(field.id)}
          </div>
        );
      
      case 'select':
        const options = field.options ? field.options.split(',').map(o => o.trim()) : [];
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={customFieldValues[field.id] || ''}
              onValueChange={val => handleCustomFieldChange(field.id, val)}
            >
              <SelectTrigger className={isError ? 'border-red-500' : ''} data-invalid={isError}>
                <SelectValue placeholder={field.placeholder || "Seçiniz"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt, idx) => (
                  <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError(field.id)}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${isError ? 'bg-red-50 border-red-200' : 'bg-[var(--surface-2)] border-[var(--border)]'}`}>
              <Checkbox
                id={field.id}
                checked={!!customFieldValues[field.id]}
                onCheckedChange={checked => handleCustomFieldChange(field.id, checked)}
                data-invalid={isError}
              />
              <Label htmlFor={field.id} className="text-sm leading-relaxed cursor-pointer">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {renderError(field.id)}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={customFieldValues[field.id] || ''}
                onChange={e => handleCustomFieldChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                className={isError ? 'border-red-500' : ''}
                data-invalid={isError}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {renderError(field.id)}
          </div>
        );

      default: // text, number
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              value={customFieldValues[field.id] || ''}
              onChange={e => handleCustomFieldChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field.id)}
              className={isError ? 'border-red-500' : ''}
              data-invalid={isError}
            />
            {renderError(field.id)}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (!program) {
    return null;
  }

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
                          data-invalid={!!(errors.fullName && touched.fullName)}
                        />
                        {renderError('fullName')}
                      </div>
                      <div className="space-y-2">
                        <Label>E-posta *</Label>
                        <Input 
                          type="email"
                          placeholder="ornek@mail.com"
                          value={formData.email} 
                          onChange={e => handleInputChange('email', e.target.value)} 
                          onBlur={() => handleBlur('email')}
                          disabled={!!userEmail}
                          className={errors.email && touched.email ? 'border-red-500' : ''}
                          data-invalid={!!(errors.email && touched.email)}
                        />
                        {renderError('email')}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] text-sm">+90</span>
                        <Input 
                          className={`pl-12 ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                          placeholder="5XX XXX XX XX"
                          value={formData.phone} 
                          onChange={e => handleInputChange('phone', e.target.value.replace(/\D/g, ''))} 
                          onBlur={() => handleBlur('phone')}
                          data-invalid={!!(errors.phone && touched.phone)}
                        />
                      </div>
                      {renderError('phone')}
                    </div>
                  </CardContent>
                </Card>

                {/* 1.5 Özel Kayıt Alanları (Varsa) */}
                {customFields.length > 0 && (
                  <Card className="card bg-[var(--surface-1)] border-[var(--border)]">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-alpha)] flex items-center justify-center text-[var(--color-primary)] text-sm">
                          <FileText className="h-4 w-4" />
                        </div>
                        Katılımcı Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customFields.map(field => renderCustomField(field))}
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
                          <Label>İl *</Label>
                          <Input 
                            placeholder="Örn: İstanbul" 
                            value={formData.city} 
                            onChange={e => handleInputChange('city', e.target.value)} 
                            onBlur={() => handleBlur('city')}
                            className={errors.city && touched.city ? 'border-red-500' : ''}
                            data-invalid={!!(errors.city && touched.city)}
                          />
                          {renderError('city')}
                        </div>
                        <div className="space-y-2">
                          <Label>İlçe *</Label>
                          <Input 
                            placeholder="Örn: Kadıköy" 
                            value={formData.district} 
                            onChange={e => handleInputChange('district', e.target.value)} 
                            onBlur={() => handleBlur('district')}
                            className={errors.district && touched.district ? 'border-red-500' : ''}
                            data-invalid={!!(errors.district && touched.district)}
                          />
                          {renderError('district')}
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
                              onBlur={() => handleBlur('tcNo')}
                              className={errors.tcNo && touched.tcNo ? 'border-red-500' : ''}
                              data-invalid={!!(errors.tcNo && touched.tcNo)}
                            />
                            {renderError('tcNo')}
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
                                <Input 
                                  placeholder="Beşiktaş V.D." 
                                  value={formData.taxOffice} 
                                  onChange={e => handleInputChange('taxOffice', e.target.value)} 
                                  onBlur={() => handleBlur('taxOffice')}
                                  className={errors.taxOffice && touched.taxOffice ? 'border-red-500' : ''}
                                  data-invalid={!!(errors.taxOffice && touched.taxOffice)}
                                />
                                {renderError('taxOffice')}
                              </div>
                              <div className="space-y-2">
                                <Label>Vergi Numarası *</Label>
                                <Input 
                                  placeholder="10 haneli" 
                                  value={formData.taxNumber} 
                                  onChange={e => handleInputChange('taxNumber', e.target.value.replace(/\D/g, ''))} 
                                  onBlur={() => handleBlur('taxNumber')}
                                  className={errors.taxNumber && touched.taxNumber ? 'border-red-500' : ''}
                                  data-invalid={!!(errors.taxNumber && touched.taxNumber)}
                                />
                                {renderError('taxNumber')}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Fatura Adresi *</Label>
                              <Textarea 
                                placeholder="Şirket tam adresi..." 
                                value={formData.billingAddress} 
                                onChange={e => handleInputChange('billingAddress', e.target.value)} 
                                onBlur={() => handleBlur('billingAddress')}
                                className={errors.billingAddress && touched.billingAddress ? 'border-red-500' : ''}
                                data-invalid={!!(errors.billingAddress && touched.billingAddress)}
                              />
                              {renderError('billingAddress')}
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
                                <Input 
                                  placeholder="JOHN DOE" 
                                  value={formData.cardName} 
                                  onChange={e => handleInputChange('cardName', e.target.value.toUpperCase())} 
                                  onBlur={() => handleBlur('cardName')}
                                  className={errors.cardName && touched.cardName ? 'border-red-500' : ''}
                                  data-invalid={!!(errors.cardName && touched.cardName)}
                                />
                                {renderError('cardName')}
                              </div>
                              <div className="space-y-2">
                                <Label>Kart Numarası</Label>
                                <Input 
                                  placeholder="0000 0000 0000 0000" 
                                  maxLength={19} 
                                  value={formData.cardNumber} 
                                  onChange={e => handleInputChange('cardNumber', e.target.value.replace(/\D/g, ''))} 
                                  onBlur={() => handleBlur('cardNumber')}
                                  className={errors.cardNumber && touched.cardNumber ? 'border-red-500' : ''}
                                  data-invalid={!!(errors.cardNumber && touched.cardNumber)}
                                />
                                {renderError('cardNumber')}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Son Kullanma</Label>
                                  <Input 
                                    placeholder="AA/YY" 
                                    maxLength={5} 
                                    value={formData.expiryDate} 
                                    onChange={e => handleInputChange('expiryDate', e.target.value)} 
                                    onBlur={() => handleBlur('expiryDate')}
                                    className={errors.expiryDate && touched.expiryDate ? 'border-red-500' : ''}
                                    data-invalid={!!(errors.expiryDate && touched.expiryDate)}
                                  />
                                  {renderError('expiryDate')}
                                </div>
                                <div className="space-y-2">
                                  <Label>CVC</Label>
                                  <Input 
                                    placeholder="000" 
                                    maxLength={3} 
                                    value={formData.cvc} 
                                    onChange={e => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))} 
                                    onBlur={() => handleBlur('cvc')}
                                    className={errors.cvc && touched.cvc ? 'border-red-500' : ''}
                                    data-invalid={!!(errors.cvc && touched.cvc)}
                                  />
                                  {renderError('cvc')}
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
                <div className="space-y-2">
                  <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${errors.kvkkConsent && touched.kvkkConsent ? 'bg-red-50 border-red-200' : 'bg-[var(--color-primary-alpha)] border-[var(--color-primary-alpha)]'}`}>
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
                  {renderError('kvkkConsent')}
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
                        {selectedPackage && (
                          <div className="flex items-center gap-1 mb-1">
                            <Package className="h-3 w-3 text-[var(--color-primary)]" />
                            <span className="text-xs font-medium text-[var(--color-primary)]">{selectedPackage.title}</span>
                          </div>
                        )}
                        {selectedDate && (
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="h-3 w-3 text-[var(--color-primary)]" />
                            <span className="text-xs font-medium text-[var(--color-primary)]">{selectedDate.title}</span>
                          </div>
                        )}
                        <p className="text-xs text-[var(--fg-muted)]">{program.age_range} Yaş • {program.duration}</p>
                        <p className="text-[var(--color-primary)] font-bold mt-1">₺{basePrice.toLocaleString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="pt-3 flex justify-between items-end">
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
                  <ShieldCheck className="h-12 w-12 text-green-500" />
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
