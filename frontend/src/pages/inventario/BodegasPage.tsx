import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Warehouse, MapPin, Phone, Mail, Users, ToggleLeft, ToggleRight } from 'lucide-react';
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

interface Bodega {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  capacidad: number | null;
  responsableNombre: string;
  responsableEmail: string;
  responsableCelular: string;
  activo: boolean;
  movimientosCount: number;
  capacidadUtilizada: number | null;
  createdAt: string;
}

export function BodegasPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; bodega: Bodega | null }>({
    open: false,
    bodega: null,
  });

  const fetchBodegas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bodegas?includeInactive=true');
      setBodegas(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar bodegas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBodegas();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.bodega) return;

    try {
      await api.delete(`/bodegas/${deleteDialog.bodega.id}`);
      toast({
        title: 'Éxito',
        description: 'Bodega eliminada correctamente',
      });
      setDeleteDialog({ open: false, bodega: null });
      fetchBodegas();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar bodega',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (bodega: Bodega) => {
    try {
      await api.patch(`/bodegas/${bodega.id}/toggle-active`);
      toast({
        title: 'Éxito',
        description: `Bodega ${bodega.activo ? 'desactivada' : 'activada'} correctamente`,
      });
      fetchBodegas();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    }
  };

  const getCapacidadBadge = (capacidad: number | null, utilizada: number | null) => {
    if (!capacidad || !utilizada) {
      return <Badge variant="outline">Sin capacidad definida</Badge>;
    }
    
    const porcentaje = (utilizada / capacidad) * 100;
    
    if (porcentaje >= 90) {
      return <Badge variant="destructive">{utilizada}%</Badge>;
    } else if (porcentaje >= 70) {
      return <Badge variant="warning">{utilizada}%</Badge>;
    } else {
      return <Badge variant="success">{utilizada}%</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bodegas</h1>
          <p className="text-muted-foreground">Gestión de bodegas de almacenamiento</p>
        </div>
        <Button onClick={() => navigate('/inventario/bodegas/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Bodega
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Movimientos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : bodegas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No se encontraron bodegas
                </TableCell>
              </TableRow>
            ) : (
              bodegas.map((bodega) => (
                <TableRow key={bodega.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-primary" />
                      <code className="text-sm">{bodega.codigo}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{bodega.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[200px] truncate">{bodega.direccion}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{bodega.responsableNombre}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="max-w-[120px] truncate">{bodega.responsableEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{bodega.responsableCelular}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {bodega.capacidad ? (
                        <>
                          <div className="text-sm">
                            {bodega.capacidad.toLocaleString()} unidades
                          </div>
                          {getCapacidadBadge(bodega.capacidad, bodega.capacidadUtilizada)}
                        </>
                      ) : (
                        <Badge variant="outline">Sin límite</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{bodega.movimientosCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={bodega.activo ? 'success' : 'destructive'}>
                      {bodega.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/inventario/bodegas/${bodega.id}`)}
                        title="Ver detalles"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/inventario/bodegas/${bodega.id}/stock`)}
                        title="Ver stock"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(bodega)}
                        title={bodega.activo ? 'Desactivar' : 'Activar'}
                      >
                        {bodega.activo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, bodega })}
                        title="Eliminar"
                        disabled={bodega.movimientosCount > 0}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, bodega: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar la bodega{' '}
              <strong>{deleteDialog.bodega?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, bodega: null })}>
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
