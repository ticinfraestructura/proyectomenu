import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Ruler, ToggleLeft, ToggleRight } from 'lucide-react';
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

interface Unidad {
  id: string;
  codigo: string;
  nombre: string;
  abreviatura: string;
  activo: boolean;
  productosCount: number;
  createdAt: string;
}

export function UnidadesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; unidad: Unidad | null }>({
    open: false,
    unidad: null,
  });

  const fetchUnidades = async () => {
    setLoading(true);
    try {
      const response = await api.get('/unidades?includeInactive=true');
      setUnidades(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar unidades de medida',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  const handleToggleActive = async (unidad: Unidad) => {
    try {
      await api.patch(`/unidades/${unidad.id}/toggle-active`);
      toast({
        title: 'Éxito',
        description: `Unidad de medida ${unidad.activo ? 'desactivada' : 'activada'} correctamente`,
      });
      fetchUnidades();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.unidad) return;

    try {
      await api.delete(`/unidades/${deleteDialog.unidad.id}`);
      toast({
        title: 'Éxito',
        description: 'Unidad de medida eliminada correctamente',
      });
      setDeleteDialog({ open: false, unidad: null });
      fetchUnidades();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar unidad de medida',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unidades de Medida</h1>
          <p className="text-muted-foreground">Gestión de unidades para el inventario</p>
        </div>
        <Button onClick={() => navigate('/configuracion/unidades/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Unidad
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Abreviatura</TableHead>
              <TableHead>Productos</TableHead>
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
            ) : unidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron unidades de medida
                </TableCell>
              </TableRow>
            ) : (
              unidades.map((unidad) => (
                <TableRow key={unidad.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      <code className="text-sm">{unidad.codigo}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{unidad.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{unidad.abreviatura}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{unidad.productosCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={unidad.activo ? 'success' : 'destructive'}>
                      {unidad.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/configuracion/unidades/${unidad.id}`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(unidad)}
                        title={unidad.activo ? 'Desactivar' : 'Activar'}
                      >
                        {unidad.activo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, unidad })}
                        title="Eliminar"
                        disabled={unidad.productosCount > 0}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, unidad: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar la unidad de medida{' '}
              <strong>{deleteDialog.unidad?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, unidad: null })}>
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
