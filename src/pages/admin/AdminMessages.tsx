import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Globe, 
  Link as LinkIcon,
  User,
  Phone,
  Loader2,
  Filter,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ip_address: string;
  referer_page: string;
  created_at: string;
  notes?: string;
}

const AdminMessages: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Submission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  // Supabase client config'indeki storage key ile aynı olmalı
  const STORAGE_KEY = 'sb-jlwsapdvizzriomadhxj-auth-token';

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Supabase client kullanmadan direkt LocalStorage'dan token okuma
  const getHeaders = () => {
    let token = '';
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        token = session.access_token;
        console.log('🔑 Token LocalStorage\'dan okundu');
      } else {
        console.warn('⚠️ LocalStorage\'da oturum bulunamadı');
      }
    } catch (e) {
      console.error('❌ Token okuma hatası:', e);
    }

    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('🚀 Mesajlar yükleniyor (Direct Fetch + LocalStorage Token)...');
      
      const headers = getHeaders(); // Artık async değil, bekleme yapmaz
      
      // 10 saniyelik zaman aşımı (timeout) ekle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/contact_submissions?select=*&order=created_at.desc`,
        { 
          headers,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Hatası:', response.status, errorText);
        throw new Error(`API Hatası: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Mesajlar başarıyla yüklendi:', data?.length);
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('❌ Fetch işlemi başarısız:', error);
      if (error.name === 'AbortError') {
        toast.error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else {
        toast.error('Mesajlar yüklenirken hata: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const headers = getHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/contact_submissions?id=eq.${id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Güncelleme başarısız');
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
      if (newStatus !== 'read') toast.success('Durum güncellendi');
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error: any) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

    try {
      const headers = getHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/contact_submissions?id=eq.${id}`,
        {
          method: 'DELETE',
          headers
        }
      );

      if (!response.ok) throw new Error('Silme başarısız');
      
      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast.success('Mesaj silindi');
      setIsDetailOpen(false);
    } catch (error: any) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-0">Yeni</Badge>;
      case 'read': return <Badge variant="outline" className="text-gray-500 border-gray-300">Okundu</Badge>;
      case 'replied': return <Badge className="bg-green-600 text-white hover:bg-green-700 border-0">Yanıtlandı</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mesajlar</h1>
          <p className="text-gray-600 dark:text-gray-400">İletişim formundan gelen tüm başvurular</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Mesajlarda ara..." 
              className="pl-10 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchSubmissions} title="Yenile">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-900">
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">Gönderen</th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">Konu</th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">Tarih</th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white">Durum</th>
                  <th className="p-4 font-semibold text-gray-900 dark:text-white text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500">Mesajlar yükleniyor...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      Mesaj bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr 
                      key={sub.id} 
                      className={`border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer ${sub.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}
                      onClick={() => {
                        setSelectedMessage(sub);
                        setIsDetailOpen(true);
                        if (sub.status === 'new') updateStatus(sub.id, 'read');
                      }}
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">{sub.name}</div>
                        <div className="text-xs text-gray-500">{sub.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">{sub.subject}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {format(new Date(sub.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-[2.85rem] w-[2.85rem] hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => {
                              setSelectedMessage(sub);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-[2.85rem] w-[2.85rem] text-red-500 hover:text-red-600 hover:bg-red-50" 
                            onClick={() => deleteSubmission(sub.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              {selectedMessage && getStatusBadge(selectedMessage.status)}
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <Calendar className="h-4 w-4" />
                {selectedMessage && format(new Date(selectedMessage.created_at), 'dd MMMM yyyy', { locale: tr })}
                <Clock className="h-4 w-4 ml-2" />
                {selectedMessage && format(new Date(selectedMessage.created_at), 'HH:mm', { locale: tr })}
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{selectedMessage.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 break-all">{selectedMessage.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{selectedMessage.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">IP Adresi</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{selectedMessage.ip_address || 'Bilinmiyor'}</p>
                  </div>
                </div>
              </div>

              {/* Referer Info */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gönderilen Sayfa</p>
                  <a 
                    href={selectedMessage.referer_page} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline mt-0.5 break-all block"
                  >
                    {selectedMessage.referer_page || '-'}
                  </a>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                  Mesaj İçeriği
                </p>
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 text-base">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Kapat</Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => updateStatus(selectedMessage!.id, 'replied')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Yanıtlandı İşaretle
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteSubmission(selectedMessage!.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
