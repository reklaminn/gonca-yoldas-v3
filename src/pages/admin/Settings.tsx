import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon,
  Save,
  Key,
  Shield,
  Mail,
  CreditCard,
  Globe,
  Bell,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Loader2,
  Wrench,
  Tag,
  FileText,
  Link as LinkIcon,
  DollarSign,
  Phone,
  MapPin,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllPaymentMethods,
  updatePaymentMethod,
  updatePaymentMethodsOrder,
  type PaymentMethod,
  type CreditCardConfig,
  type BankTransferConfig,
  type IyzilinkConfig
} from '@/services/paymentSettings';
import {
  getGeneralSettings,
  updateGeneralSettings,
  type GeneralSettings
} from '@/services/generalSettings';

const SettingsPage: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOrderChanged, setIsOrderChanged] = useState(false);

  // General Settings State
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('');
  const [language, setLanguage] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [couponEnabled, setCouponEnabled] = useState(true);
  const [invoiceEnabled, setInvoiceEnabled] = useState(true);
  const [showPricesWithVAT, setShowPricesWithVAT] = useState(true);
  const [coursesExternalUrl, setCoursesExternalUrl] = useState('');

  // Credit Card State
  const [creditCardActive, setCreditCardActive] = useState(false);
  const [iyzicoApiKey, setIyzicoApiKey] = useState('');
  const [iyzicoSecretKey, setIyzicoSecretKey] = useState('');
  const [iyzicoBaseUrl, setIyzicoBaseUrl] = useState('https://api.iyzipay.com');

  // Bank Transfer State
  const [bankTransferActive, setBankTransferActive] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [iban, setIban] = useState('');
  const [instructions, setInstructions] = useState('');

  // Iyzilink State
  const [iyziLinkActive, setIyziLinkActive] = useState(false);
  const [iyziLinkInstructions, setIyziLinkInstructions] = useState('');

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Loading all settings...');
      
      // Load payment methods
      const methods = await getAllPaymentMethods();
      setPaymentMethods(methods);

      // Load Credit Card settings
      const creditCard = methods.find(m => m.payment_method === 'credit_card');
      if (creditCard) {
        setCreditCardActive(creditCard.is_active);
        const config = creditCard.config as CreditCardConfig;
        setIyzicoApiKey(config.api_key || '');
        setIyzicoSecretKey(config.secret_key || '');
        setIyzicoBaseUrl(config.base_url || 'https://api.iyzipay.com');
      }

      // Load Bank Transfer settings
      const bankTransfer = methods.find(m => m.payment_method === 'bank_transfer');
      if (bankTransfer) {
        setBankTransferActive(bankTransfer.is_active);
        const config = bankTransfer.config as BankTransferConfig;
        setBankName(config.bank_name || '');
        setAccountHolder(config.account_holder || '');
        setIban(config.iban || '');
        setInstructions(config.instructions || '');
      }

      // Load Iyzilink settings
      const iyzilink = methods.find(m => m.payment_method === 'iyzilink');
      if (iyzilink) {
        setIyziLinkActive(iyzilink.is_active);
        const config = iyzilink.config as IyzilinkConfig;
        setIyziLinkInstructions(config.instructions || 'Ödeme işlemini tamamlamak için güvenli ödeme sayfasına yönlendirileceksiniz.');
      }

      // Load general settings
      const settings = await getGeneralSettings();
      
      if (settings) {
        setGeneralSettings(settings);
        setSiteName(settings.site_name);
        setSiteUrl(settings.site_url);
        setSiteDescription(settings.site_description);
        setContactEmail(settings.contact_email);
        setSupportEmail(settings.support_email);
        setPhone(settings.phone || '');
        setAddress(settings.address || '');
        setTimezone(settings.timezone);
        setLanguage(settings.language);
        setMaintenanceMode(settings.maintenance_mode_active);
        setCouponEnabled(settings.coupon_enabled);
        setInvoiceEnabled(settings.invoice_enabled);
        setShowPricesWithVAT(settings.show_prices_with_vat);
        setCoursesExternalUrl(settings.courses_external_url);
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    if (!generalSettings) {
      toast.error('Ayarlar yüklenemedi');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateGeneralSettings(generalSettings.id, {
        site_name: siteName,
        site_url: siteUrl,
        site_description: siteDescription,
        contact_email: contactEmail,
        support_email: supportEmail,
        phone,
        address,
        timezone,
        language,
        maintenance_mode_active: maintenanceMode,
        coupon_enabled: couponEnabled,
        invoice_enabled: invoiceEnabled,
        show_prices_with_vat: showPricesWithVAT,
        courses_external_url: coursesExternalUrl,
      });

      if (success) {
        await loadAllSettings();
      }
    } catch (error) {
      console.error('❌ Error saving general settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCheckoutSettings = async () => {
    if (!generalSettings) {
      toast.error('Ayarlar yüklenemedi');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateGeneralSettings(generalSettings.id, {
        invoice_enabled: invoiceEnabled,
        show_prices_with_vat: showPricesWithVAT,
      });

      if (success) {
        await loadAllSettings();
      }
    } catch (error) {
      console.error('❌ Error saving checkout settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCreditCard = async () => {
    const creditCard = paymentMethods.find(m => m.payment_method === 'credit_card');
    if (!creditCard) {
      toast.error('Kredi kartı ayarları bulunamadı');
      return;
    }

    setIsSaving(true);
    try {
      const config: CreditCardConfig = {
        provider: 'iyzico',
        api_key: iyzicoApiKey,
        secret_key: iyzicoSecretKey,
        base_url: iyzicoBaseUrl,
      };

      const success = await updatePaymentMethod(creditCard.id, {
        is_active: creditCardActive,
        config,
      });

      if (success) {
        await loadAllSettings();
      }
    } catch (error) {
      console.error('Error saving credit card settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankTransfer = async () => {
    const bankTransfer = paymentMethods.find(m => m.payment_method === 'bank_transfer');
    if (!bankTransfer) {
      toast.error('Havale ayarları bulunamadı');
      return;
    }

    if (bankTransferActive && !iban.trim()) {
      toast.error('IBAN numarası gereklidir');
      return;
    }

    setIsSaving(true);
    try {
      const config: BankTransferConfig = {
        bank_name: bankName,
        account_holder: accountHolder,
        iban: iban,
        instructions: instructions,
      };

      const success = await updatePaymentMethod(bankTransfer.id, {
        is_active: bankTransferActive,
        config,
      });

      if (success) {
        await loadAllSettings();
      }
    } catch (error) {
      console.error('Error saving bank transfer settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIyzilink = async () => {
    const iyzilink = paymentMethods.find(m => m.payment_method === 'iyzilink');
    if (!iyzilink) {
      toast.error('İyzilink ayarları bulunamadı');
      return;
    }

    setIsSaving(true);
    try {
      const config: IyzilinkConfig = {
        instructions: iyziLinkInstructions,
      };

      const success = await updatePaymentMethod(iyzilink.id, {
        is_active: iyziLinkActive,
        config,
      });

      if (success) {
        await loadAllSettings();
      }
    } catch (error) {
      console.error('Error saving iyzilink settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Payment Method Sorting Logic ---

  const movePaymentMethod = (index: number, direction: 'up' | 'down') => {
    const newMethods = [...paymentMethods];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newMethods.length) return;

    // Swap items
    const temp = newMethods[index];
    newMethods[index] = newMethods[targetIndex];
    newMethods[targetIndex] = temp;
    
    setPaymentMethods(newMethods);
    setIsOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      // Prepare items with new display_order AND all required fields to satisfy NOT NULL constraints
      const updates = paymentMethods.map((method, index) => ({
        id: method.id,
        payment_method: method.payment_method, // REQUIRED for upsert
        is_active: method.is_active,
        config: method.config,
        display_order: index + 1
      }));

      const success = await updatePaymentMethodsOrder(updates);
      
      if (success) {
        setIsOrderChanged(false);
        await loadAllSettings(); // Reload to ensure sync
      }
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Kredi Kartı (iyzico)';
      case 'bank_transfer': return 'Havale / EFT';
      case 'iyzilink': return 'İyzilink';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return CreditCard;
      case 'bank_transfer': return Building2;
      case 'iyzilink': return LinkIcon;
      default: return CreditCard;
    }
  };

  const integrations = [
    {
      name: 'Supabase',
      status: 'connected',
      description: 'Veritabanı ve kimlik doğrulama',
      icon: Database,
      lastSync: '2 dakika önce'
    },
    {
      name: 'iyzico',
      status: creditCardActive ? 'connected' : 'disconnected',
      description: 'Ödeme işlemleri',
      icon: CreditCard,
      lastSync: creditCardActive ? '5 dakika önce' : 'Devre dışı'
    },
    {
      name: 'n8n',
      status: 'connected',
      description: 'Otomasyon ve iş akışları',
      icon: Zap,
      lastSync: '10 dakika önce'
    },
    {
      name: 'SendPulse',
      status: 'connected',
      description: 'E-posta pazarlama',
      icon: Mail,
      lastSync: '1 saat önce'
    },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      connected: { label: 'Bağlı', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      disconnected: { label: 'Bağlı Değil', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      warning: { label: 'Uyarı', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    };
    const statusConfig = config[status as keyof typeof config];
    const Icon = statusConfig.icon;
    return (
      <Badge variant="outline" className={statusConfig.color}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sistem ayarlarını yapılandırın</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="integrations">Entegrasyonlar</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="email">E-posta</TabsTrigger>
          <TabsTrigger value="payment">Ödeme</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Genel Ayarlar</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Site genelindeki temel ayarları yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name" className="text-gray-900 dark:text-white">Site Adı</Label>
                    <Input 
                      id="site-name" 
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-url" className="text-gray-900 dark:text-white">Site URL</Label>
                    <Input 
                      id="site-url" 
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description" className="text-gray-900 dark:text-white">Site Açıklaması</Label>
                  <Textarea 
                    id="site-description" 
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-gray-900 dark:text-white">İletişim E-postası</Label>
                    <Input 
                      id="contact-email" 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-gray-900 dark:text-white">Destek E-postası</Label>
                    <Input 
                      id="support-email" 
                      type="email" 
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon Numarası
                    </Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 (555) 123 45 67"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adres
                    </Label>
                    <Textarea 
                      id="address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Şirket adresi..."
                      rows={2}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courses-external-url" className="text-gray-900 dark:text-white">Kurslar Harici URL</Label>
                  <Input 
                    id="courses-external-url" 
                    value={coursesExternalUrl}
                    onChange={(e) => setCoursesExternalUrl(e.target.value)}
                    placeholder="https://goncayoldas.com/courses"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Kurslar sayfası için harici bir URL kullanılacaksa buraya girin
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-gray-900 dark:text-white">Saat Dilimi</Label>
                  <select 
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-gray-900 dark:text-white">Varsayılan Dil</Label>
                  <select 
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Bakım Modu</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Siteyi geçici olarak kapatın</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-900 dark:text-white">
                      {maintenanceMode ? 'Aktif' : 'Pasif'}
                    </Label>
                    <Switch
                      id="maintenance-mode"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                </div>

                {maintenanceMode && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Bakım Modu Aktif</p>
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          Site şu anda bakım modunda. Sadece admin kullanıcılar erişebilir.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coupon System Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Kupon Kodu Sistemi</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ödeme sayfasında kupon kodu alanını göster</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="coupon-enabled" className="text-sm font-medium text-gray-900 dark:text-white">
                      {couponEnabled ? 'Aktif' : 'Pasif'}
                    </Label>
                    <Switch
                      id="coupon-enabled"
                      checked={couponEnabled}
                      onCheckedChange={setCouponEnabled}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneralSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Değişiklikleri Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Entegrasyonlar</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Üçüncü parti servis bağlantılarını yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map((integration, index) => {
                    const Icon = integration.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                              {getStatusBadge(integration.status)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Son senkronizasyon: {integration.lastSync}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Yapılandır</Button>
                          <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Test Et</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">API Anahtarları</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Servis API anahtarlarını yönetin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="supabase-url" className="text-gray-900 dark:text-white">Supabase URL</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                    >
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input 
                    id="supabase-url" 
                    type={showApiKeys ? 'text' : 'password'}
                    defaultValue="https://jlwsapdvizzriomadhxj.supabase.co"
                    readOnly
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-key" className="text-gray-900 dark:text-white">Supabase Anon Key</Label>
                  <Input 
                    id="supabase-key" 
                    type={showApiKeys ? 'text' : 'password'}
                    defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    readOnly
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="n8n-webhook" className="text-gray-900 dark:text-white">n8n Webhook URL</Label>
                  <Input 
                    id="n8n-webhook" 
                    type={showApiKeys ? 'text' : 'password'}
                    placeholder="n8n webhook URL'niz"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendpulse-key" className="text-gray-900 dark:text-white">SendPulse API Key</Label>
                  <Input 
                    id="sendpulse-key" 
                    type={showApiKeys ? 'text' : 'password'}
                    placeholder="SendPulse API anahtarınız"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    API Anahtarlarını Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Güvenlik Ayarları</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Sistem güvenlik yapılandırması</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">İki Faktörlü Kimlik Doğrulama</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yönetici hesapları için zorunlu 2FA</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Etkin</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Oturum Zaman Aşımı</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Otomatik çıkış süresi</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="30">30 dakika</option>
                    <option value="60">1 saat</option>
                    <option value="120">2 saat</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Şifre Karmaşıklığı</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Minimum şifre gereksinimleri</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Yapılandır</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Hesap Kilitleme</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Başarısız giriş denemesi limiti</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="3">3 deneme</option>
                    <option value="5">5 deneme</option>
                    <option value="10">10 deneme</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">IP Kısıtlaması</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Admin paneli için IP beyaz listesi</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Devre Dışı</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Güvenlik Logları</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tüm güvenlik olaylarını kaydet</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Etkin</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Güvenlik Ayarlarını Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">E-posta Ayarları</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">E-posta gönderim yapılandırması</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host" className="text-gray-900 dark:text-white">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="smtp.example.com" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port" className="text-gray-900 dark:text-white">SMTP Port</Label>
                  <Input id="smtp-port" placeholder="587" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user" className="text-gray-900 dark:text-white">SMTP Kullanıcı Adı</Label>
                  <Input id="smtp-user" type="email" placeholder="noreply@goncayoldas.com" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass" className="text-gray-900 dark:text-white">SMTP Şifre</Label>
                  <Input id="smtp-pass" type="password" placeholder="••••••••" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email" className="text-gray-900 dark:text-white">Gönderen E-posta</Label>
                <Input id="from-email" type="email" defaultValue="noreply@goncayoldas.com" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-name" className="text-gray-900 dark:text-white">Gönderen Adı</Label>
                <Input id="from-name" defaultValue="Gonca Yoldaş" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">E-posta Şablonları</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Hoş Geldiniz E-postası</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yeni kullanıcı kaydı</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Düzenle</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Şifre Sıfırlama</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Şifre sıfırlama talebi</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Düzenle</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Sipariş Onayı</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Başarılı sipariş bildirimi</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Düzenle</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Kurs Erişimi</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Kurs erişim bilgileri</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Düzenle</Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">Test E-postası Gönder</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  E-posta Ayarlarını Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="space-y-6">
            {/* Checkout Form Settings */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <FileText className="h-5 w-5" />
                      Ödeme Formu Ayarları
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Ödeme sayfasında gösterilecek alanları yönetin</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Fatura Bilgileri Alanı</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ödeme sayfasında adres ve fatura bilgilerini göster</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="invoice-enabled" className="text-sm font-medium text-gray-900 dark:text-white">
                      {invoiceEnabled ? 'Aktif' : 'Pasif'}
                    </Label>
                    <Switch
                      id="invoice-enabled"
                      checked={invoiceEnabled}
                      onCheckedChange={setInvoiceEnabled}
                    />
                  </div>
                </div>

                {!invoiceEnabled && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Fatura Bilgileri Gizlendi</p>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          Ödeme sayfasında adres, il, ilçe ve vergi bilgileri sorulmayacak. Sadece Ad Soyad, E-posta ve Telefon bilgileri alınacak.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* KDV Display Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">KDV'li Fiyat Gösterimi</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ödeme ve fiyatlandırma sayfalarında KDV dahil fiyatları göster</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-prices-with-vat" className="text-sm font-medium text-gray-900 dark:text-white">
                      {showPricesWithVAT ? 'KDV Dahil' : 'KDV Hariç'}
                    </Label>
                    <Switch
                      id="show-prices-with-vat"
                      checked={showPricesWithVAT}
                      onCheckedChange={setShowPricesWithVAT}
                    />
                  </div>
                </div>

                {showPricesWithVAT ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-300 mb-1">KDV Dahil Fiyatlar Gösteriliyor</p>
                        <p className="text-sm text-green-800 dark:text-green-400">
                          Tüm fiyatlar KDV dahil olarak gösterilecek. Örnek: ₺12,000 (KDV Dahil)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">KDV Hariç Fiyatlar Gösteriliyor</p>
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          Tüm fiyatlar KDV hariç olarak gösterilecek. Örnek: ₺10,000 + KDV
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveCheckoutSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Ayarları Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Settings */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <CreditCard className="h-5 w-5" />
                      Kredi Kartı (iyzico)
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Kredi kartı ödemelerini yapılandırın</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="credit-card-active" className="text-sm font-medium text-gray-900 dark:text-white">
                      {creditCardActive ? 'Aktif' : 'Pasif'}
                    </Label>
                    <Switch
                      id="credit-card-active"
                      checked={creditCardActive}
                      onCheckedChange={setCreditCardActive}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="iyzico-api-key" className="text-gray-900 dark:text-white">iyzico API Key</Label>
                  <Input
                    id="iyzico-api-key"
                    type={showApiKeys ? 'text' : 'password'}
                    value={iyzicoApiKey}
                    onChange={(e) => setIyzicoApiKey(e.target.value)}
                    placeholder="iyzico API anahtarınız"
                    disabled={!creditCardActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iyzico-secret-key" className="text-gray-900 dark:text-white">iyzico Secret Key</Label>
                  <Input
                    id="iyzico-secret-key"
                    type={showApiKeys ? 'text' : 'password'}
                    value={iyzicoSecretKey}
                    onChange={(e) => setIyzicoSecretKey(e.target.value)}
                    placeholder="iyzico gizli anahtarınız"
                    disabled={!creditCardActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iyzico-base-url" className="text-gray-900 dark:text-white">iyzico Base URL</Label>
                  <Input
                    id="iyzico-base-url"
                    value={iyzicoBaseUrl}
                    onChange={(e) => setIyzicoBaseUrl(e.target.value)}
                    placeholder="https://api.iyzipay.com"
                    disabled={!creditCardActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Test ortamı için: https://sandbox-api.iyzipay.com
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    Kredi kartı ödemeleri için iyzico hesabınızdan API anahtarlarını alın.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showApiKeys ? 'Gizle' : 'Göster'}
                  </Button>
                  <Button onClick={handleSaveCreditCard} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Settings */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Building2 className="h-5 w-5" />
                      Havale / EFT
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Banka havalesi bilgilerini yapılandırın</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bank-transfer-active" className="text-sm font-medium text-gray-900 dark:text-white">
                      {bankTransferActive ? 'Aktif' : 'Pasif'}
                    </Label>
                    <Switch
                      id="bank-transfer-active"
                      checked={bankTransferActive}
                      onCheckedChange={setBankTransferActive}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name" className="text-gray-900 dark:text-white">Banka Adı</Label>
                  <Input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Örn: Ziraat Bankası"
                    disabled={!bankTransferActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-holder" className="text-gray-900 dark:text-white">Hesap Sahibi</Label>
                  <Input
                    id="account-holder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Örn: Gonca Yoldaş Eğitim Ltd. Şti."
                    disabled={!bankTransferActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban" className="text-gray-900 dark:text-white">IBAN *</Label>
                  <Input
                    id="iban"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    maxLength={32}
                    disabled={!bankTransferActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  {bankTransferActive && !iban.trim() && (
                    <p className="text-xs text-red-500 dark:text-red-400">IBAN numarası gereklidir</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-gray-900 dark:text-white">Ödeme Talimatları</Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Havale yaparken açıklama kısmına sipariş numaranızı yazınız..."
                    rows={4}
                    disabled={!bankTransferActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bu metin müşterilere ödeme sayfasında gösterilecektir
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-300">
                    Havale ödemelerinde sipariş onayı manuel olarak yapılmalıdır.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBankTransfer} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Iyzilink Settings */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <LinkIcon className="h-5 w-5" />
                      İyzilink ile Ödeme
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">İyzilink ödeme linkini yapılandırın</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="iyzilink-active" className="text-sm font-medium text-gray-900 dark:text-white">
                      {iyziLinkActive ? 'Aktif' : 'Pasif'}
                    </Label>
                    <Switch
                      id="iyzilink-active"
                      checked={iyziLinkActive}
                      onCheckedChange={setIyziLinkActive}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="iyzilink-instructions" className="text-gray-900 dark:text-white">Ödeme Talimatları</Label>
                  <Textarea
                    id="iyzilink-instructions"
                    value={iyziLinkInstructions}
                    onChange={(e) => setIyziLinkInstructions(e.target.value)}
                    placeholder="Ödeme işlemini tamamlamak için güvenli ödeme sayfasına yönlendirileceksiniz."
                    rows={4}
                    disabled={!iyziLinkActive}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bu metin müşterilere ödeme sayfasında gösterilecektir
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <p className="text-sm text-purple-900 dark:text-purple-300">
                    İyzilink ile ödeme seçeneği aktif olduğunda, müşteriler güvenli bir ödeme linkine yönlendirilecektir.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveIyzilink} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary & Sorting */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 dark:text-white">Ödeme Yöntemleri Sıralaması</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Ödeme sayfasında görünecek sırayı düzenleyin</CardDescription>
                  </div>
                  {isOrderChanged && (
                    <Button onClick={handleSaveOrder} disabled={isSaving} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Sıralamayı Kaydet
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method, index) => {
                    const Icon = getPaymentMethodIcon(method.payment_method);
                    return (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getPaymentMethodLabel(method.payment_method)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(method.is_active ? 'connected' : 'disconnected')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => movePaymentMethod(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => movePaymentMethod(index, 'down')}
                            disabled={index === paymentMethods.length - 1}
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!creditCardActive && !bankTransferActive && !iyziLinkActive && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-900 dark:text-red-300 font-medium">
                        Uyarı: Hiçbir ödeme yöntemi aktif değil!
                      </p>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      Müşteriler sipariş veremeyecektir. Lütfen en az bir ödeme yöntemini aktif edin.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
