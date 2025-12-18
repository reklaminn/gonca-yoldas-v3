import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Plus, Edit, Trash2, Star, Eye, EyeOff, Loader2, GripVertical, Image as ImageIcon, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTestimonials } from '@/hooks/useTestimonials';
import { usePrograms } from '@/hooks/usePrograms';
import { ImagePicker } from '@/components/admin/ImagePicker';
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

interface TestimonialFormData {
  parent_name: string;
  student_info: string;
  testimonial_text: string;
  rating: number;
  image_url: string;
  program_slug: string;
  is_featured: boolean;
  is_active: boolean;
}

const emptyForm: TestimonialFormData = {
  parent_name: '',
  student_info: '',
  testimonial_text: '',
  rating: 5,
  image_url: '',
  program_slug: 'none',
  is_featured: false,
  is_active: true,
};

interface SortableTestimonialCardProps {
  testimonial: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  programTitle?: string;
}

const SortableTestimonialCard: React.FC<SortableTestimonialCardProps> = ({
  testimonial,
  onEdit,
  onDelete,
  onToggleActive,
  programTitle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleActive();
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <Card className={cn(
        'transition-all duration-300',
        !testimonial.is_active && 'opacity-60 bg-gray-50 dark:bg-gray-900'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{testimonial.parent_name}</CardTitle>
                {testimonial.is_featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                    Öne Çıkan
                  </span>
                )}
              </div>
              <CardDescription className="text-sm">
                {testimonial.student_info}
              </CardDescription>
              {programTitle && (
                <div className="flex items-center gap-1.5 mt-2">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {programTitle}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleClick}
                className={cn(
                  'transition-colors',
                  testimonial.is_active
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                )}
                title={testimonial.is_active ? "Gizle" : "Göster"}
              >
                {testimonial.is_active ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            "{testimonial.testimonial_text}"
          </p>
          {testimonial.image_url && (
            <div className="mt-3">
              <img
                src={testimonial.image_url}
                alt={testimonial.parent_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TestimonialsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { testimonials, loading, createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials } = useTestimonials();
  const { programs, loading: programsLoading } = usePrograms('active');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = testimonials.findIndex((t) => t.id === active.id);
      const newIndex = testimonials.findIndex((t) => t.id === over.id);

      const newOrder = arrayMove(testimonials, oldIndex, newIndex);
      await reorderTestimonials(newOrder);
    }
  };

  const handleOpenDialog = (testimonial?: any) => {
    if (testimonial) {
      setEditingId(testimonial.id);
      setFormData({
        parent_name: testimonial.parent_name || '',
        student_info: testimonial.student_info || '',
        testimonial_text: testimonial.testimonial_text || '',
        rating: testimonial.rating || 5,
        image_url: testimonial.image_url || '',
        program_slug: testimonial.program_slug || 'none',
        is_featured: testimonial.is_featured || false,
        is_active: testimonial.is_active !== undefined ? testimonial.is_active : true,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSave = async () => {
    if (!formData.parent_name.trim() || !formData.student_info.trim() || !formData.testimonial_text.trim()) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSaving(true);

      const dataToSave = {
        ...formData,
        program_slug: formData.program_slug === 'none' ? null : formData.program_slug,
      };

      if (editingId) {
        await updateTestimonial(editingId, dataToSave);
        toast.success('Yorum güncellendi');
      } else {
        await createTestimonial(dataToSave);
        toast.success('Yorum eklendi');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Yorum kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteTestimonial(id);
      toast.success('Yorum silindi');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Yorum silinirken bir hata oluştu');
    }
  };

  const handleToggleActive = async (testimonial: any) => {
    try {
      await updateTestimonial(testimonial.id, {
        is_active: !testimonial.is_active,
      });
      toast.success(testimonial.is_active ? 'Yorum gizlendi' : 'Yorum gösterildi');
    } catch (error) {
      console.error('Error toggling testimonial:', error);
      toast.error('Yorum durumu değiştirilirken bir hata oluştu');
    }
  };

  const getProgramTitle = (slug: string | null) => {
    if (!slug || slug === 'none') return undefined;
    const program = programs.find(p => p.slug === slug);
    return program?.short_title || program?.title;
  };

  // Group testimonials by program
  const groupedTestimonials = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {
      none: [],
    };

    testimonials.forEach((testimonial) => {
      const slug = testimonial.program_slug || 'none';
      if (!groups[slug]) {
        groups[slug] = [];
      }
      groups[slug].push(testimonial);
    });

    return groups;
  }, [testimonials]);

  // Get program statistics
  const programStats = React.useMemo(() => {
    return programs.map(program => ({
      ...program,
      testimonialCount: groupedTestimonials[program.slug]?.length || 0,
    }));
  }, [programs, groupedTestimonials]);

  if (loading || programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeCount = testimonials.filter((t) => t.is_active).length;
  const featuredCount = testimonials.filter((t) => t.is_featured).length;
  const unmappedCount = groupedTestimonials['none']?.length || 0;

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
              Velilerimiz Ne Diyor?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {activeCount} aktif yorum • {featuredCount} öne çıkan • {unmappedCount} programa atanmamış
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yorum Ekle
        </Button>
      </div>

      {/* Program Statistics */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Program Eşleştirmeleri
          </CardTitle>
          <CardDescription>
            Her programa ait yorum sayıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programStats.map((program) => (
              <div
                key={program.id}
                className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {program.short_title || program.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {program.age_range}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {program.testimonialCount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      yorum
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {unmappedCount > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Programa Atanmamış
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                      Genel yorumlar
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {unmappedCount}
                    </p>
                    <p className="text-xs text-orange-500 dark:text-orange-400">
                      yorum
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
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
                <li>• Sol taraftaki tutamacı kullanarak yorumları sürükleyip sıralayabilirsiniz</li>
                <li>• Göz ikonuna tıklayarak yorumu aktif/pasif yapabilirsiniz</li>
                <li>• "Öne Çıkan" işaretli yorumlar anasayfada öncelikli gösterilir</li>
                <li>• Yıldız sayısı 1-5 arasında ayarlanabilir</li>
                <li>• <strong>Program seçimi</strong> ile yorumu belirli bir programa atayabilirsiniz</li>
                <li>• Programa atanmış yorumlar, o programın sayfasında gösterilir</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={testimonials.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <SortableTestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                programTitle={getProgramTitle(testimonial.program_slug)}
                onEdit={() => handleOpenDialog(testimonial)}
                onDelete={() => handleDelete(testimonial.id)}
                onToggleActive={() => handleToggleActive(testimonial)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {testimonials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Henüz yorum eklenmemiş. Yeni yorum eklemek için yukarıdaki butona tıklayın.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Yorum Düzenle' : 'Yeni Yorum Ekle'}
            </DialogTitle>
            <DialogDescription>
              Veli yorumunu ekleyin veya düzenleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Veli Adı *</Label>
                <Input
                  id="parent_name"
                  placeholder="Ayşe Yılmaz"
                  value={formData.parent_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_info">Öğrenci Bilgisi *</Label>
                <Input
                  id="student_info"
                  placeholder="5 yaşında kızım"
                  value={formData.student_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, student_info: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial_text">Yorum *</Label>
              <Textarea
                id="testimonial_text"
                placeholder="Çocuğumun gelişimi hakkında düşünceleriniz..."
                rows={4}
                value={formData.testimonial_text}
                onChange={(e) => setFormData(prev => ({ ...prev, testimonial_text: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Yıldız Sayısı</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        <div className="flex items-center gap-1">
                          {[...Array(num)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="program_slug">
                  Program (Opsiyonel)
                  <span className="text-xs text-gray-500 ml-2">
                    Yorumu bir programa atayın
                  </span>
                </Label>
                <Select
                  value={formData.program_slug}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, program_slug: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Program seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Programa Atanmamış</span>
                      </div>
                    </SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.slug}>
                        <div className="flex items-col gap-1">
                          <span className="font-medium">{program.short_title || program.title}</span>
                          <span className="text-xs text-gray-500">({program.age_range})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Fotoğraf URL (Opsiyonel)</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="flex-1"
                />
                <ImagePicker 
                  value={formData.image_url} 
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  trigger={
                    <Button variant="outline" size="icon" title="Resim Seç">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/80?text=Invalid';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Öne Çıkan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Aktif</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManagement;
