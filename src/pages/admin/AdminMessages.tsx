import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Yol düzeltildi: supabase -> supabaseClient
import { 
  Mail, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Eye, 
  Globe, 
  Link as LinkIcon,
  User,
  Phone,
  Calendar,
  Loader2,
  MoreVertical,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Mesajlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
      if (newStatus !== 'read') toast.success('Durum güncellendi');
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast.success('Mesaj silindi');
      setIsDetailOpen(false);
    } catch (error) {
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
      case 'new': return <Badge className="bg-blue-500">Yeni</Badge>;
      case 'read': return <Badge variant="outline" className="text-gray-500">Okundu</Badge>;
      case 'replied': return <Badge className="bg-green-500">Yanıtlandı</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Mesajlar</h1>
          <p className="text-[var(--text-secondary)]">İletişim formundan gelen tüm başvurular</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input 
              placeholder="Mesajlarda ara..." 
              className="pl-10 w-full md:w-[300px] bg-[var(--surface)] border-[var(--border)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchSubmissions} className="border-[var(--border)]">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <th className="p-4 font-semibold text-[var(--text)]">Gönderen</th>
                  <th className="p-4 font-semibold text-[var(--text)]">Konu</th>
                  <th className="p-4 font-semibold text-[var(--text)]">Tarih</th>
                  <th className="p-4 font-semibold text-[var(--text)]">Durum</th>
                  <th className="p-4 font-semibold text-[var(--text)] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-primary)]" />
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[var(--text-secondary)]">
                      Mesaj bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr 
                      key={sub.id} 
                      className={`border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors cursor-pointer ${sub.status === 'new' ? 'bg-[var(--color-primary)]/5' : ''}`}
                      onClick={() => {
                        setSelectedMessage(sub);
                        setIsDetailOpen(true);
                        if (sub.status === 'new') updateStatus(sub.id, 'read');
                      }}
                    >
                      <td className="p-4">
                        <div className="font-medium text-[var(--text)]">{sub.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{sub.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[var(--text)] line-clamp-1">{sub.subject}</div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {format(new Date(sub.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedMessage(sub);
                            setIsDetailOpen(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => deleteSubmission(sub.id)}>
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-w-2xl bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              {selectedMessage && getStatusBadge(selectedMessage.status)}
              <div className="text-xs text-[var(--text-secondary)]">
                {selectedMessage && format(new Date(selectedMessage.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">{selectedMessage?.subject}</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Mesaj detayları ve gönderen bilgileri
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <User className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Ad Soyad</p>
                    <p className="text-sm font-medium">{selectedMessage.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <Mail className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">E-posta</p>
                    <p className="text-sm font-medium">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <Phone className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Telefon</p>
                    <p className="text-sm font-medium">{selectedMessage.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <Globe className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">IP Adresi</p>
                    <p className="text-sm font-medium">{selectedMessage.ip_address || 'Bilinmiyor'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <LinkIcon className="h-5 w-5 text-[var(--color-primary)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-secondary)]">Gönderilen Sayfa</p>
                  <p className="text-sm font-medium truncate">{selectedMessage.referer_page || '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Mesaj:</p>
                <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="border-[var(--border)]">Kapat</Button>
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
