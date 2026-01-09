import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePrograms, deleteProgram } from '@/hooks/usePrograms';
import { useAgeGroups } from '@/hooks/useAgeGroups';
import { useToast } from '@/hooks/use-toast';
import { AgeGroupsManager } from '@/components/admin/AgeGroupsManager';
import { 
  BookOpen, 
  Search, 
  Plus,
  Edit,
  Eye,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Settings2,
  RefreshCw
} from 'lucide-react';

const AdminPrograms: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Age Group Management State
  const [manageAgeGroupsOpen, setManageAgeGroupsOpen] = useState(false);
  
  const { programs, loading, error, refetch } = usePrograms();
  const { 
    ageGroups, 
    refetch: refetchAgeGroups 
  } = useAgeGroups();

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Aktif', variant: 'default' as const, icon: CheckCircle },
      draft: { label: 'Pasif', variant: 'secondary' as const, icon: Eye },
    };
    const statusConfig = config[status as keyof typeof config] || config.draft;
    const Icon = statusConfig.icon;
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getAgeGroupBadge = (ageGroupValue: string) => {
    // Find label from dynamic groups or fallback to value
    const group = ageGroups.find(g => g.value === ageGroupValue);
    const label = group ? group.label : `${ageGroupValue} yaş`;
    
    // Generate a consistent color based on the value string
    const colors = [
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-orange-100 text-orange-700 border-orange-200',
    ];
    
    // Simple hash to pick a color
    const colorIndex = ageGroupValue.length % colors.length;
    
    return (
      <Badge variant="outline" className={colors[colorIndex]}>
        {label}
      </Badge>
    );
  };

  const handleEditClick = (programId: string) => {
    navigate(`/admin/programs/edit/${programId}`);
  };

  const handleNewProgram = () => {
    navigate('/admin/programs/new');
  };

  const handleDeleteClick = (programId: string) => {
    setProgramToDelete(programId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProgram(programToDelete);
      
      toast({
        title: "Başarılı!",
        description: "Program başarıyla silindi.",
        variant: "default",
      });

      await refetch();
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Hata!",
        description: error instanceof Error ? error.message : "Program silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProgramToDelete(null);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgeGroup = selectedAgeGroup === 'all' || program.age_group === selectedAgeGroup;
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    return matchesSearch && matchesAgeGroup && matchesStatus;
  });

  const stats = [
    {
      label: 'Toplam Program',
      value: programs.length,
      icon: BookOpen,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Aktif Program',
      value: programs.filter(p => p.status === 'active').length,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
    },
    {
      label: 'Toplam Öğrenci',
      value: programs.reduce((sum, p) => sum + (p.enrolled_students || 0), 0),
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Toplam Ders',
      value: programs.reduce((sum, p) => sum + (p.lessons_per_week || 0), 0),
      icon: Clock,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-[var(--fg-muted)]">Programlar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-[var(--fg)]">Bir hata oluştu</h3>
        <p className="text-[var(--fg-muted)] text-center max-w-md">{error}</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--fg)]">Program Yönetimi</h1>
            <p className="text-[var(--fg-muted)] mt-2">Eğitim programlarını görüntüleyin ve yönetin</p>
          </div>
          <Button 
            onClick={handleNewProgram}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Program
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--fg-muted)] mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-[var(--fg)]">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
              <Input
                placeholder="Program ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedAgeGroup === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedAgeGroup('all')}
                  size="sm"
                >
                  Tüm Yaşlar
                </Button>
                
                {ageGroups.map((group) => (
                  <Button
                    key={group.id}
                    variant={selectedAgeGroup === group.value ? 'default' : 'outline'}
                    onClick={() => setSelectedAgeGroup(group.value)}
                    size="sm"
                  >
                    {group.label}
                  </Button>
                ))}
              </div>

              {/* Manage Age Groups Button */}
              <Dialog open={manageAgeGroupsOpen} onOpenChange={setManageAgeGroupsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Yaş Gruplarını Yönet">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Yaş Gruplarını Yönet</DialogTitle>
                    <DialogDescription>
                      Filtreleme seçeneklerini buradan düzenleyebilir ve sıralayabilirsiniz.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <AgeGroupsManager embedded onChange={refetchAgeGroups} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-all duration-200 border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--color-primary)] flex flex-col">
            <CardHeader className="flex-shrink-0">
              {program.image_url ? (
                <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                  <img 
                    src={program.image_url} 
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative h-32 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-t-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-white opacity-50" />
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-2 text-[var(--fg)] line-clamp-1">{program.title}</CardTitle>
                  <CardDescription className="text-sm text-[var(--fg-muted)] line-clamp-1">{program.title_en}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {getAgeGroupBadge(program.age_group || '')}
                {getStatusBadge(program.status || 'draft')}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-[var(--fg-muted)] mb-4 line-clamp-2">{program.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-[var(--fg-muted)] mb-1">Süre</p>
                  <p className="font-semibold text-[var(--fg)]">{program.duration}</p>
                </div>
                <div>
                  <p className="text-[var(--fg-muted)] mb-1">Haftalık Ders</p>
                  <p className="font-semibold text-[var(--fg)]">{program.lessons_per_week} ders</p>
                </div>
                <div>
                  <p className="text-[var(--fg-muted)] mb-1">Öğrenci</p>
                  <p className="font-semibold text-[var(--fg)]">{program.enrolled_students}</p>
                </div>
                <div>
                  <p className="text-[var(--fg-muted)] mb-1">Fiyat</p>
                  <p className="font-semibold text-[var(--fg)]">₺{program.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to={`/programs/${program.slug}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Görüntüle
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditClick(String(program.id))}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteClick(String(program.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPrograms.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-[var(--fg-muted)] mx-auto mb-4" />
            <p className="text-[var(--fg-muted)] text-lg">Program bulunamadı</p>
            <Button onClick={handleNewProgram} variant="link" className="mt-2">
              Yeni bir program oluşturun
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 shadow-2xl max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center text-gray-900 dark:text-white">
              Programı Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base leading-relaxed text-gray-600 dark:text-gray-400">
              Bu programı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve programla ilgili tüm veriler silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 font-semibold"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-0 font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPrograms;
