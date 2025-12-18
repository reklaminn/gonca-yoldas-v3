import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  useAllPageContent, 
  updatePageContent, 
  createPageContent,
  deletePageContent,
  type PageContent 
} from '@/hooks/usePageContent';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Save, 
  Plus,
  GripVertical,
  Trash2,
  Loader2
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pageNames: Record<string, string> = {
  home: 'Anasayfa',
  about: 'Hakkımızda',
  contact: 'İletişim',
  'learning-platform': 'Öğrenme Platformu',
};

const contentTypes = [
  { value: 'text', label: 'Metin' },
  { value: 'html', label: 'HTML' },
  { value: 'image_url', label: 'Resim URL' },
  { value: 'json', label: 'JSON' },
];

interface SortableItemProps {
  item: PageContent;
  onToggleActive: (id: string, currentState: boolean) => void;
  onUpdate: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ item, onToggleActive, onUpdate, onDelete }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content_value || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // 🔥 FIX: Use ref to capture current value
  const editValueRef = useRef(editValue);

  // Update both state and ref when item changes
  useEffect(() => {
    const newValue = item.content_value || '';
    setEditValue(newValue);
    editValueRef.current = newValue;
  }, [item.content_value]);

  // Update ref whenever editValue changes
  useEffect(() => {
    editValueRef.current = editValue;
  }, [editValue]);

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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    // 🔥 FIX: Use ref value instead of state
    const currentValue = editValueRef.current;
    
    console.log('💾 handleSave called:', {
      stateValue: editValue,
      refValue: currentValue,
      itemValue: item.content_value
    });

    if (currentValue === item.content_value) {
      console.log('⏭️ No changes, skipping save');
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      console.log('📤 Sending to database:', currentValue);
      await onUpdate(item.id, currentValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const originalValue = item.content_value || '';
    setEditValue(originalValue);
    editValueRef.current = originalValue;
    setIsEditing(false);
  };

  const handleInputChange = (value: string) => {
    console.log('✏️ Input changed:', value);
    setEditValue(value);
    editValueRef.current = value;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${!item.is_active ? 'opacity-50 bg-gray-50 dark:bg-gray-900' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Drag Handle */}
              <button
                className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5" />
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{item.section_key}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {contentTypes.find(t => t.value === item.content_type)?.label}
                  </Badge>
                  {!item.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Gizli
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Sıra: {item.display_order}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Active Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(item.id, item.is_active)}
                title={item.is_active ? 'Gizle' : 'Göster'}
              >
                {item.is_active ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                title="Sil"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {item.content_type === 'html' || item.content_type === 'json' ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                  disabled={isSaving}
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={isSaving}
                />
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  size="sm"
                  disabled={isSaving}
                >
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
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  size="sm"
                  disabled={isSaving}
                >
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-md transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.content_value || '(Boş)'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const ContentEditor: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { contentItems, loading, error, refetch, updateLocalItem } = useAllPageContent(pageKey || '');
  const [items, setItems] = useState<PageContent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    section_key: '',
    content_type: 'text',
    content_value: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setItems(contentItems);
  }, [contentItems]);

  if (!pageKey || !pageNames[pageKey]) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Geçersiz sayfa</p>
      </div>
    );
  }

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      console.log('🔄 Toggling active state:', { id, currentState, newState: !currentState });
      
      // Update local state immediately
      updateLocalItem(id, { is_active: !currentState });
      
      // Update database
      await updatePageContent(id, { is_active: !currentState });
      
      console.log('✅ Toggle successful');
      
      toast({
        title: 'Başarılı',
        description: currentState ? 'İçerik gizlendi' : 'İçerik gösterildi',
      });
      
    } catch (err) {
      console.error('❌ Toggle error:', err);
      // Revert local state on error
      updateLocalItem(id, { is_active: currentState });
      toast({
        title: 'Hata',
        description: 'İçerik durumu değiştirilemedi',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (id: string, value: string) => {
    try {
      console.log('💾 handleUpdate called with value:', value);
      
      // Update local state immediately (optimistic update)
      updateLocalItem(id, { content_value: value });
      
      // Update database
      const result = await updatePageContent(id, { 
        content_value: value,
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Update successful:', result);

      toast({
        title: 'Başarılı',
        description: 'İçerik başarıyla güncellendi',
      });

    } catch (err) {
      console.error('❌ Update error:', err);
      // Revert on error
      await refetch();
      toast({
        title: 'Hata',
        description: err instanceof Error ? err.message : 'İçerik güncellenemedi',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu içeriği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deletePageContent(id);
      toast({
        title: 'Başarılı',
        description: 'İçerik silindi',
      });
      await refetch();
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Hata',
        description: 'İçerik silinemedi',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      const updates = newItems.map((item, index) => 
        updatePageContent(item.id, { display_order: index })
      );
      await Promise.all(updates);

      toast({
        title: 'Başarılı',
        description: 'Sıralama güncellendi',
      });
    } catch (err) {
      console.error('Reorder error:', err);
      toast({
        title: 'Hata',
        description: 'Sıralama güncellenemedi',
        variant: 'destructive',
      });
      setItems(contentItems);
    }
  };

  const handleAddSection = async () => {
    if (!newSection.section_key.trim()) {
      toast({
        title: 'Hata',
        description: 'Bölüm anahtarı gerekli',
        variant: 'destructive',
      });
      return;
    }

    try {
      const maxOrder = Math.max(...items.map(i => i.display_order), -1);
      
      await createPageContent({
        page_key: pageKey,
        section_key: newSection.section_key,
        content_type: newSection.content_type,
        content_value: newSection.content_value,
        display_order: maxOrder + 1,
        is_active: true,
      });

      toast({
        title: 'Başarılı',
        description: 'Yeni bölüm eklendi',
      });

      setIsAddDialogOpen(false);
      setNewSection({
        section_key: '',
        content_type: 'text',
        content_value: '',
      });
      
      await refetch();
    } catch (err) {
      console.error('Add section error:', err);
      toast({
        title: 'Hata',
        description: 'Bölüm eklenemedi',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
              {pageNames[pageKey]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Sayfa içeriğini düzenleyin
            </p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Bölüm Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Bölüm Ekle</DialogTitle>
              <DialogDescription>
                Sayfaya yeni bir içerik bölümü ekleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="section_key">Bölüm Anahtarı</Label>
                <Input
                  id="section_key"
                  placeholder="ornek_bolum_adi"
                  value={newSection.section_key}
                  onChange={(e) => setNewSection({ ...newSection, section_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_type">İçerik Tipi</Label>
                <Select
                  value={newSection.content_type}
                  onValueChange={(value) => setNewSection({ ...newSection, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_value">İçerik</Label>
                <Textarea
                  id="content_value"
                  placeholder="İçerik değeri"
                  value={newSection.content_value}
                  onChange={(e) => setNewSection({ ...newSection, content_value: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddSection}>
                Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Items */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Bu sayfada henüz içerik yok</p>
          </CardContent>
        </Card>
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
            <div className="space-y-4">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onToggleActive={handleToggleActive}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ContentEditor;
