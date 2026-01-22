import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
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

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  productosCount: number;
  createdAt: string;
}

export function CategoriasPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; categoria: Categoria | null }>({
    open: false,
    categoria: null,
  });

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categorias?includeInactive=true');
      setCategorias(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar categorías',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleToggleActive = async (categoria: Categoria) => {
    try {
      await api.patch(`/categorias/${categoria.id}/toggle-active`);
      toast({
        title: 'Éxito',
        description: `Categoría ${categoria.activo ? 'desactivada' : 'activada'} correctamente`,
      });
      fetchCategorias();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.categoria) return;

    try {
      await api.delete(`/categorias/${deleteDialog.categoria.id}`);
      toast({
        title: 'Éxito',
        description: 'Categoría eliminada correctamente',
      });
      setDeleteDialog({ open: false, categoria: null });
      fetchCategorias();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar categoría',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías de Productos</h1>
          <p className="text-muted-foreground">Gestión de categorías para el inventario</p>
        </div>
        <Button onClick={() => navigate('/configuracion/categorias/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
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
            ) : categorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron categorías
                </TableCell>
              </TableRow>
            ) : (
              categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <code className="text-sm">{categoria.codigo}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{categoria.nombre}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {categoria.descripcion || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoria.productosCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoria.activo ? 'success' : 'destructive'}>
                      {categoria.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/configuracion/categorias/${categoria.id}`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(categoria)}
                        title={categoria.activo ? 'Desactivar' : 'Activar'}
                      >
                        {categoria.activo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, categoria })}
                        title="Eliminar"
                        disabled={categoria.productosCount > 0}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, categoria: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar la categoría{' '}
              <strong>{deleteDialog.categoria?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, categoria: null })}>
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
