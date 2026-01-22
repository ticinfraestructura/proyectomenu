import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
}

interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  abreviatura: string;
}

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: Categoria;
  unidadMedida: UnidadMedida;
  stockMinimo: number;
  stockActual: number;
  perecedero: boolean;
  fechaVencimiento: string | null;
  descripcion: string | null;
  activo: boolean;
  stockStatus: string;
  movimientosCount: number;
  createdAt: string;
}

export function ProductosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; producto: Producto | null }>({
    open: false,
    producto: null,
  });
  const [filters, setFilters] = useState({
    search: '',
    categoriaId: 'all',
  });

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.categoriaId && filters.categoriaId !== 'all') params.append('categoriaId', filters.categoriaId);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/productos?${params.toString()}`);
      setProductos(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar categorías',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteDialog.producto) return;

    try {
      await api.delete(`/productos/${deleteDialog.producto.id}`);
      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente',
      });
      setDeleteDialog({ open: false, producto: null });
      fetchProductos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar producto',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (producto: Producto) => {
    try {
      await api.patch(`/productos/${producto.id}/toggle-active`);
      toast({
        title: 'Éxito',
        description: `Producto ${producto.activo ? 'desactivado' : 'activado'} correctamente`,
      });
      fetchProductos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    }
  };

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'agotado':
        return <Badge variant="destructive">Agotado</Badge>;
      case 'bajo':
        return <Badge variant="warning">Bajo</Badge>;
      case 'medio':
        return <Badge variant="default">Medio</Badge>;
      case 'optimo':
        return <Badge variant="success">Óptimo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'agotado':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'bajo':
        return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'medio':
        return <Minus className="h-4 w-4 text-blue-500" />;
      case 'optimo':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestión de productos del inventario</p>
        </div>
        <Button onClick={() => navigate('/inventario/productos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por código o nombre..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="w-64">
          <Select value={filters.categoriaId} onValueChange={(value) => setFilters({ ...filters, categoriaId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Perecedero</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <code className="text-sm">{producto.codigo}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{producto.categoria.nombre}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{producto.unidadMedida.abreviatura}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStockIcon(producto.stockStatus)}
                      <span className="font-medium">{producto.stockActual}</span>
                      <span className="text-sm text-muted-foreground">/ {producto.stockMinimo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStockStatusBadge(producto.stockStatus)}</TableCell>
                  <TableCell>
                    <Badge variant={producto.perecedero ? 'warning' : 'success'}>
                      {producto.perecedero ? 'Sí' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/inventario/productos/${producto.id}`)}
                        title="Ver detalles"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(producto)}
                        title={producto.activo ? 'Desactivar' : 'Activar'}
                      >
                        {producto.activo ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <Package className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, producto })}
                        title="Eliminar"
                        disabled={producto.movimientosCount > 0}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, producto: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el producto{' '}
              <strong>{deleteDialog.producto?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, producto: null })}>
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
