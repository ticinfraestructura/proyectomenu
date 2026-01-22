import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';

interface TipoDesastre {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  eventosCount: number;
  createdAt: string;
}

export function TiposDesastrePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tipos, setTipos] = useState<TipoDesastre[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tipo: TipoDesastre | null }>({
    open: false,
    tipo: null,
  });

  const fetchTipos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tipos-desastre?includeInactive=true');
      setTipos(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar tipos de desastre',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleToggleActive = async (tipo: TipoDesastre) => {
    try {
      await api.patch(`/tipos-desastre/${tipo.id}/toggle-active`);
      toast({
        title: 'Éxito',
        description: `Tipo de desastre ${tipo.activo ? 'desactivado' : 'activado'} correctamente`,
      });
      fetchTipos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.tipo) return;

    try {
      await api.delete(`/tipos-desastre/${deleteDialog.tipo.id}`);
      toast({
        title: 'Éxito',
        description: 'Tipo de desastre eliminado correctamente',
      });
      setDeleteDialog({ open: false, tipo: null });
      fetchTipos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar tipo de desastre',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Desastre</h1>
          <p className="text-muted-foreground">Catálogo de tipos de desastre para eventos</p>
        </div>
        <Button onClick={() => navigate('/emergencias/tipos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : tipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron tipos de desastre
                </TableCell>
              </TableRow>
            ) : (
              tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <code className="text-sm">{tipo.codigo}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{tipo.nombre}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {tipo.descripcion || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tipo.eventosCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tipo.activo ? 'success' : 'destructive'}>
                      {tipo.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/emergencias/tipos/${tipo.id}`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(tipo)}
                        title={tipo.activo ? 'Desactivar' : 'Activar'}
                      >
                        {tipo.activo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, tipo })}
                        title="Eliminar"
                        disabled={tipo.eventosCount > 0}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, tipo: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el tipo de desastre{' '}
              <strong>{deleteDialog.tipo?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, tipo: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
