import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAllPageContent, updatePageContent, createPageContent } from '@/hooks/usePageContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Eye, EyeOff, Loader2, Save, Check, GripVertical, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImagePicker } from '@/components/admin/ImagePicker';
import { ComplexJsonEditor } from '@/components/admin/ComplexJsonEditor';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const PAGE_TITLES: Record<string, string> = {
  'global': 'Genel Ayarlar',
  'home': 'Anasayfa',
  'about': 'Hakkımızda',
  'contact': 'İletişim',
  'learning-platform': 'Öğrenme Platformu',
  'legal-privacy': 'Gizlilik Politikası',
  'legal-terms': 'Kullanım Koşulları',
  'legal-cookies': 'Çerez Politikası',
  'legal-kvkk': 'KVKK Aydınlatma Metni',
  'legal-distance-sales': 'Mesafeli Satış Sözleşmesi',
};

const CONTENT_TYPES = [
  { value: 'text', label: 'Metin' },
  { value: 'rich_text', label: 'Zengin Metin (HTML)' },
  { value: 'image_url', label: 'Görsel URL' },
  { value: 'json', label: 'Liste / Veri' },
];

interface SectionCardProps {
  item: any;
  onToggle: () => void;
  onSave: (newValue: string) => Promise<void>;
  saving: boolean;
  saved: boolean;
}

const SortableSectionCard: React.FC<SectionCardProps> = ({
  item,
  onToggle,
  onSave,
  saving,
  saved,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Helper to safely get string value
  const getSafeValue = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const [localValue, setLocalValue] = useState(getSafeValue(item.content_value));

  useEffect(() => {
    setLocalValue(getSafeValue(item.content_value));
  }, [item.content_value]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveClick = async () => {
    await onSave(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(getSafeValue(item.content_value));
    setIsEditing(false);
  };

  const renderPreview = () => {
    if (!localValue) return <p className="text-sm text-gray-400 italic">İçerik girilmemiş</p>;

    if (item.content_type === 'image_url') {
      return (
        <div className="mt-2">
          <img
            src={localValue}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border bg-gray-100"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
            }}
          />
        </div>
      );
    }

    if (item.content_type === 'json') {
      try {
        const parsed = JSON.parse(localValue);
        
        // Handle complex objects preview
        if (!Array.isArray(parsed) && typeof parsed === 'object') {
           return (
            <div className="space-y-1">
              {parsed.title && <p className="font-medium text-sm">{parsed.title}</p>}
              {parsed.items && Array.isArray(parsed.items) && (
                <p className="text-xs text-gray-500">{parsed.items.length} liste öğesi</p>
              )}
              {parsed.features && Array.isArray(parsed.features) && (
                <p className="text-xs text-gray-500">{parsed.features.length} özellik</p>
              )}
            </div>
           );
        }

        const count = Array.isArray(parsed) ? parsed.length : 0;
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {count} Öğe
            </span>
            <span className="truncate max-w-md opacity-70">
              {localValue}
            </span>
          </div>
        );
      } catch (e) {
        return <p className="text-sm text-red-500">Geçersiz JSON verisi</p>;
      }
    }

    if (item.content_type === 'rich_text') {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
           <div dangerouslySetInnerHTML={{ __html: localValue }} />
        </div>
      );
    }

    return (
      <p className="text-sm whitespace-pre-wrap break-words line-clamp-4">
        {localValue}
      </p>
    );
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <Card
        className={cn(
          'transition-all duration-300',
          !item.is_active && 'opacity-60 bg-gray-50 dark:bg-gray-900'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <button
              className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <CardTitle className="text-lg break-all">
                {item.section_key}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {CONTENT_TYPES.find(t => t.value === item.content_type)?.label || item.content_type}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <div className="flex items-center gap-1 text-green-600 text-sm animate-in fade-in duration-300">
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Kaydedildi</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className={cn(
                  'transition-colors',
                  item.is_active
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                )}
                title={item.is_active ? "Gizle" : "Göster"}
              >
                {item.is_active ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {item.content_type === 'text' && (item.section_key.includes('description') || item.section_key.includes('text')) ? (
                <Textarea
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder="İçerik giriniz..."
                />
              ) : item.content_type === 'rich_text' ? (
                <RichTextEditor
                  value={localValue}
                  onChange={setLocalValue}
                />
              ) : item.content_type === 'json' ? (
                <ComplexJsonEditor 
                  value={localValue} 
                  onChange={setLocalValue} 
                  sectionKey={item.section_key}
                />
              ) : item.content_type === 'image_url' ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={localValue}
                      onChange={(e) => setLocalValue(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <ImagePicker 
                      value={localValue} 
                      onChange={(url) => setLocalValue(url)}
                      trigger={
                        <Button variant="outline" size="icon" title="Resim Seç">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                  {localValue && (
                    <div className="mt-2 relative group">
                      <img
                        src={localValue}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  type="text"
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  placeholder="İçerik giriniz..."
                />
              )}

              <div className="flex items-center gap-2 mt-4">
                <Button
                  onClick={handleSaveClick}
                  disabled={saving}
                  size="sm"
                  className="flex-1"
                >
                  {saving ? (
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
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={saving}
                >
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'p-3 rounded-lg border bg-gray-50 dark:bg-gray-900 min-h-[60px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                !item.is_active && 'opacity-60'
              )}
              onClick={() => setIsEditing(true)}
            >
              {renderPreview()}
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                variant="outline"
                size="sm"
                className="w-full mt-3"
              >
                Düzenle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PageContentEditor: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const navigate = useNavigate();
  const { contentItems, loading, refetch } = useAllPageContent(pageKey || '');
  
  const [items, setItems] = useState<any[]>([]);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    section_key: '',
    content_type: 'text',
    content_value: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (contentItems.length > 0) {
      setItems(contentItems);
    } else if (!loading && contentItems.length === 0) {
      // Eğer içerik yoksa boş liste göster, sonsuz döngüye girme
      setItems([]);
    }
  }, [contentItems, loading]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        const updates = newItems.map((item, index) => 
          updatePageContent(item.id, { display_order: index + 1 })
        );
        await Promise.all(updates);
        toast.success('Sıralama güncellendi');
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error('Sıralama güncellenirken hata oluştu');
        setItems(items);
      }
    }
  };

  const handleSave = async (itemId: string, newValue: string) => {
    try {
      setSavingStates((prev) => ({ ...prev, [itemId]: true }));

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, content_value: newValue } : item
      ));

      await updatePageContent(itemId, {
        content_value: newValue,
      });

      setSavedStates((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setSavedStates((prev) => ({ ...prev, [itemId]: false }));
      }, 2000);

      toast.success('İçerik güncellendi');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('İçerik güncellenirken bir hata oluştu');
    } finally {
      setSavingStates((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleToggle = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const newStatus = !item.is_active;

      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, is_active: newStatus } : i
      ));

      await updatePageContent(itemId, {
        is_active: newStatus,
      });

      toast.success(
        newStatus
          ? 'İçerik aktif hale getirildi'
          : 'İçerik pasif hale getirildi'
      );
    } catch (error) {
      console.error('Error toggling content:', error);
      toast.error('İçerik durumu değiştirilirken bir hata oluştu');
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, is_active: !i.is_active } : i
      ));
    }
  };

  const handleCreateSection = async () => {
    if (!newSection.section_key.trim()) {
      toast.error('Alan anahtarı gereklidir');
      return;
    }

    try {
      setIsCreating(true);

      const maxOrder = items.length > 0 ? Math.max(...items.map(item => item.display_order), 0) : 0;

      await createPageContent({
        page_key: pageKey || '',
        section_key: newSection.section_key,
        content_type: newSection.content_type,
        content_value: newSection.content_value,
        display_order: maxOrder + 1,
        is_active: true,
      });

      toast.success('Yeni alan başarıyla eklendi!');
      setIsAddDialogOpen(false);
      setNewSection({
        section_key: '',
        content_type: 'text',
        content_value: '',
      });
      refetch();
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Alan eklenirken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pageKey || !PAGE_TITLES[pageKey]) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sayfa bulunamadı</p>
        <Button onClick={() => navigate('/admin/content')} className="mt-4">
          Geri Dön
        </Button>
      </div>
    );
  }

  const activeCount = items.filter((item) => item.is_active).length;
  const totalCount = items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/content')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {PAGE_TITLES[pageKey]} İçeriği
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {activeCount} / {totalCount} alan aktif
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Alan Ekle
        </Button>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Nasıl Kullanılır?
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Sol taraftaki tutamacı kullanarak alanları sürükleyip sıralayabilirsiniz</li>
                <li>• Göz ikonuna tıklayarak alanı aktif/pasif yapabilirsiniz</li>
                <li>• Kartın üzerine tıklayarak anlık düzenleme yapabilirsiniz</li>
                <li>• Liste alanlarında (Özellikler, Yorumlar) özel editör açılır</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed">
          <p className="text-gray-500">Bu sayfa için henüz içerik eklenmemiş.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            İlk İçeriği Ekle
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {items.map((item) => (
                <SortableSectionCard
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggle(item.id)}
                  onSave={(newValue) => handleSave(item.id, newValue)}
                  saving={savingStates[item.id] || false}
                  saved={savedStates[item.id] || false}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Alan Ekle</DialogTitle>
            <DialogDescription>
              Sayfaya yeni bir içerik alanı ekleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section_key">Alan Anahtarı *</Label>
              <Input
                id="section_key"
                placeholder="ornek_alan_adi"
                value={newSection.section_key}
                onChange={(e) => setNewSection(prev => ({ ...prev, section_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_type">İçerik Tipi</Label>
              <Select
                value={newSection.content_type}
                onValueChange={(value) => setNewSection(prev => ({ ...prev, content_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_value">İçerik (Opsiyonel)</Label>
              {newSection.content_type === 'image_url' ? (
                <div className="flex gap-2">
                  <Input
                    id="content_value"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newSection.content_value}
                    onChange={(e) => setNewSection(prev => ({ ...prev, content_value: e.target.value }))}
                    className="flex-1"
                  />
                  <ImagePicker 
                    value={newSection.content_value} 
                    onChange={(url) => setNewSection(prev => ({ ...prev, content_value: url }))}
                    trigger={
                      <Button variant="outline" size="icon" title="Resim Seç">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              ) : newSection.content_type === 'rich_text' ? (
                 <RichTextEditor
                  value={newSection.content_value}
                  onChange={(val) => setNewSection(prev => ({ ...prev, content_value: val }))}
                />
              ) : (
                <Textarea
                  id="content_value"
                  placeholder="İçerik giriniz..."
                  rows={4}
                  value={newSection.content_value}
                  onChange={(e) => setNewSection(prev => ({ ...prev, content_value: e.target.value }))}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isCreating}
            >
              İptal
            </Button>
            <Button onClick={handleCreateSection} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Ekle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageContentEditor;
