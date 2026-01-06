import React, { useState } from 'react';
import { useAgeGroups, AgeGroup } from '@/hooks/useAgeGroups';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface AgeGroupsManagerProps {
  embedded?: boolean;
  onChange?: () => void;
}

export const AgeGroupsManager: React.FC<AgeGroupsManagerProps> = ({ embedded = false, onChange }) => {
  const { ageGroups, loading, addAgeGroup, updateAgeGroup, deleteAgeGroup, refetch } = useAgeGroups();
  
  // Yeni ekleme state'leri
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Düzenleme state'leri
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');

  const notifyChange = () => {
    if (onChange) onChange();
  };

  const handleAdd = async () => {
    if (!newLabel || !newValue) {
      toast.error('Lütfen etiket ve değer alanlarını doldurun');
      return;
    }

    try {
      setIsAdding(true);
      const maxOrder = ageGroups.length > 0 
        ? Math.max(...ageGroups.map(g => g.sort_order || 0)) 
        : 0;
      
      console.log('Adding age group:', { label: newLabel, value: newValue, sortOrder: maxOrder + 1 });
      
      await addAgeGroup(newLabel, newValue, maxOrder + 1);
      setNewLabel('');
      setNewValue('');
      toast.success('Yaş grubu başarıyla eklendi');
      notifyChange();
    } catch (error) {
      console.error('Age group add error:', error);
      toast.error('Ekleme başarısız oldu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (group: AgeGroup) => {
    setEditingId(group.id);
    setEditLabel(group.label);
    setEditValue(group.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditValue('');
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateAgeGroup(id, { label: editLabel, value: editValue });
      setEditingId(null);
      toast.success('Güncellendi');
      notifyChange();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAgeGroup(id);
      toast.success('Silindi');
      notifyChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === ageGroups.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentGroup = ageGroups[index];
    const targetGroup = ageGroups[targetIndex];

    try {
      // Optimistic UI update could be done here, but for safety we wait
      await updateAgeGroup(currentGroup.id, { sort_order: targetGroup.sort_order });
      await updateAgeGroup(targetGroup.id, { sort_order: currentGroup.sort_order });
      await refetch();
      notifyChange();
    } catch (error) {
      console.error('Move error:', error);
      toast.error('Sıralama güncellenemedi');
    }
  };

  const Content = (
    <div className="space-y-6">
      {/* Ekleme Formu */}
      <div className="p-4 bg-[var(--bg)] rounded-lg border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-medium text-[var(--fg)]">Yeni Grup Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-[var(--fg-muted)]">Etiket (Görünen İsim)</label>
            <Input 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Örn: 7-12 Yaş"
              className="bg-[var(--bg-input)]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--fg-muted)]">Değer (Kod/Filtre)</label>
            <Input 
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Örn: 7-12"
              className="bg-[var(--bg-input)]"
            />
          </div>
        </div>
        <Button 
          onClick={handleAdd} 
          disabled={isAdding}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Grubu Ekle
        </Button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--fg)]">Mevcut Gruplar</h3>
        
        {loading ? (
          <div className="text-center py-8 text-[var(--fg-muted)]">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Yükleniyor...
          </div>
        ) : ageGroups.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--fg-muted)]">
            Henüz yaş grubu eklenmemiş.
          </div>
        ) : (
          ageGroups.map((group, index) => (
            <div 
              key={group.id} 
              className="group flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:shadow-sm transition-all"
            >
              {/* Sıralama Kontrolleri */}
              <div className="flex sm:flex-col gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-[var(--bg-hover)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  title="Yukarı Taşı"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-[var(--bg-hover)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === ageGroups.length - 1}
                  title="Aşağı Taşı"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              {/* İçerik Alanı */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                {editingId === group.id ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs text-[var(--fg-muted)]">Etiket</span>
                      <Input 
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-[var(--fg-muted)]">Değer</span>
                      <Input 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-[10px] text-[var(--fg-muted)]">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-[var(--fg)]">{group.label}</span>
                    </div>
                    <div className="flex items-center">
                      <code className="text-xs bg-[var(--bg-hover)] px-2 py-1 rounded text-[var(--fg-muted)]">
                        {group.value}
                      </code>
                    </div>
                  </>
                )}
              </div>

              {/* İşlem Butonları */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border)]">
                {editingId === group.id ? (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdate(group.id)} 
                      className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                    >
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      Kaydet
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="h-8 px-3"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      İptal
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => startEdit(group)}
                      className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Silmek istediğinize emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{group.label}" yaş grubu kalıcı olarak silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(group.id)} className="bg-red-600 hover:bg-red-700">
                            Evet, Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (embedded) {
    return Content;
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--bg-card)] w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
          <Users className="h-5 w-5 text-[var(--color-primary)]" />
          Yaş Grupları Yönetimi
        </CardTitle>
        <CardDescription>Programlar için yaş grubu filtrelerini yönetin</CardDescription>
      </CardHeader>
      <CardContent>
        {Content}
      </CardContent>
    </Card>
  );
};
