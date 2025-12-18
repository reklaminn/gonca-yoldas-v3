import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  Download, 
  Building2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save,
  Loader2 
} from 'lucide-react';
import {
  getAllPaymentMethods,
  updatePaymentMethod,
  type PaymentMethod,
  type CreditCardConfig,
  type BankTransferConfig
} from '@/services/paymentSettings';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  
  // Payment Settings State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

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

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoadingPayments(true);
    try {
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
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleSaveCreditCard = async () => {
    const creditCard = paymentMethods.find(m => m.payment_method === 'credit_card');
    if (!creditCard) {
      toast.error('Kredi kartı ayarları bulunamadı');
      return;
    }

    setIsSavingPayment(true);
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
        await loadPaymentMethods();
      }
    } catch (error) {
      console.error('Error saving credit card settings:', error);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSaveBankTransfer = async () => {
    const bankTransfer = paymentMethods.find(m => m.payment_method === 'bank_transfer');
    if (!bankTransfer) {
      toast.error('Havale ayarları bulunamadı');
      return;
    }

    // Validate IBAN if bank transfer is active
    if (bankTransferActive && !iban.trim()) {
      toast.error('IBAN numarası gereklidir');
      return;
    }

    setIsSavingPayment(true);
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
        await loadPaymentMethods();
      }
    } catch (error) {
      console.error('Error saving bank transfer settings:', error);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Profil bilgileriniz güncellendi');
    setLoading(false);
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Bildirim ayarlarınız güncellendi');
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Şifreniz güncellendi');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground mt-2">Hesap ayarlarınızı yönetin</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Ödeme
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user?.full_name?.[0] || user?.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">Fotoğraf Değiştir</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG veya GIF. Maksimum 2MB.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    defaultValue={user?.full_name || ''}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ''}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+90 (555) 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Doğum Tarihi</Label>
                  <Input
                    id="birthdate"
                    type="date"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">E-posta Bildirimleri</h4>
                    <p className="text-sm text-muted-foreground">
                      Yeni dersler ve güncellemeler hakkında e-posta alın
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Ders Hatırlatıcıları</h4>
                    <p className="text-sm text-muted-foreground">
                      Yaklaşan dersler için hatırlatıcı alın
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">İlerleme Raporları</h4>
                    <p className="text-sm text-muted-foreground">
                      Haftalık ilerleme raporları alın
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Pazarlama E-postaları</h4>
                    <p className="text-sm text-muted-foreground">
                      Yeni programlar ve özel teklifler hakkında bilgi alın
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>Hesabınızın güvenliğini yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Button>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-4">İki Faktörlü Kimlik Doğrulama</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Hesabınıza ekstra bir güvenlik katmanı ekleyin
                </p>
                <Button variant="outline">İki Faktörlü Doğrulamayı Etkinleştir</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          {isLoadingPayments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Credit Card Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Kredi Kartı (iyzico)
                      </CardTitle>
                      <CardDescription>Kredi kartı ödemelerini yapılandırın</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="credit-card-active" className="text-sm font-medium">
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
                    <Label htmlFor="iyzico-api-key">iyzico API Key</Label>
                    <Input
                      id="iyzico-api-key"
                      type={showApiKeys ? 'text' : 'password'}
                      value={iyzicoApiKey}
                      onChange={(e) => setIyzicoApiKey(e.target.value)}
                      placeholder="iyzico API anahtarınız"
                      disabled={!creditCardActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iyzico-secret-key">iyzico Secret Key</Label>
                    <Input
                      id="iyzico-secret-key"
                      type={showApiKeys ? 'text' : 'password'}
                      value={iyzicoSecretKey}
                      onChange={(e) => setIyzicoSecretKey(e.target.value)}
                      placeholder="iyzico gizli anahtarınız"
                      disabled={!creditCardActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iyzico-base-url">iyzico Base URL</Label>
                    <Input
                      id="iyzico-base-url"
                      value={iyzicoBaseUrl}
                      onChange={(e) => setIyzicoBaseUrl(e.target.value)}
                      placeholder="https://api.iyzipay.com"
                      disabled={!creditCardActive}
                    />
                    <p className="text-xs text-muted-foreground">
                      Test ortamı için: https://sandbox-api.iyzipay.com
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Kredi kartı ödemeleri için iyzico hesabınızdan API anahtarlarını alın.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                    >
                      {showApiKeys ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showApiKeys ? 'Gizle' : 'Göster'}
                    </Button>
                    <Button onClick={handleSaveCreditCard} disabled={isSavingPayment}>
                      {isSavingPayment ? (
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Havale / EFT
                      </CardTitle>
                      <CardDescription>Banka havalesi bilgilerini yapılandırın</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bank-transfer-active" className="text-sm font-medium">
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
                    <Label htmlFor="bank-name">Banka Adı</Label>
                    <Input
                      id="bank-name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Örn: Ziraat Bankası"
                      disabled={!bankTransferActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-holder">Hesap Sahibi</Label>
                    <Input
                      id="account-holder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Örn: Gonca Yoldaş Eğitim Ltd. Şti."
                      disabled={!bankTransferActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input
                      id="iban"
                      value={iban}
                      onChange={(e) => setIban(e.target.value.toUpperCase())}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      maxLength={32}
                      disabled={!bankTransferActive}
                    />
                    {bankTransferActive && !iban.trim() && (
                      <p className="text-xs text-red-500">IBAN numarası gereklidir</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Ödeme Talimatları</Label>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Havale yaparken açıklama kısmına sipariş numaranızı yazınız..."
                      rows={4}
                      disabled={!bankTransferActive}
                    />
                    <p className="text-xs text-muted-foreground">
                      Bu metin müşterilere ödeme sayfasında gösterilecektir
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      Havale ödemelerinde sipariş onayı manuel olarak yapılmalıdır.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveBankTransfer} disabled={isSavingPayment}>
                      {isSavingPayment ? (
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

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme Yöntemleri Özeti</CardTitle>
                  <CardDescription>Aktif ödeme yöntemlerinin durumu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Kredi Kartı</p>
                          <p className="text-sm text-muted-foreground">iyzico entegrasyonu</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        creditCardActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {creditCardActive ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Havale / EFT</p>
                          <p className="text-sm text-muted-foreground">Banka transferi</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        bankTransferActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {bankTransferActive ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>
                  </div>

                  {!creditCardActive && !bankTransferActive && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                          Uyarı: Hiçbir ödeme yöntemi aktif değil!
                        </p>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Müşteriler sipariş veremeyecektir. Lütfen en az bir ödeme yöntemini aktif edin.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing History (Original Content) */}
              <Card>
                <CardHeader>
                  <CardTitle>Fatura Geçmişi</CardTitle>
                  <CardDescription>Geçmiş ödemelerinizi görüntüleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Baby English (0-2 Yaş)</p>
                          <p className="text-sm text-muted-foreground">1 Ocak 2025</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">₺1,500</span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
