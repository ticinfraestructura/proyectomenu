import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, TrendingUp, TrendingDown, AlertTriangle, Package, Calendar, User } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Bodega {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

interface Movimiento {
  id: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  observaciones: string | null;
  bodega: Bodega;
  registradoPor: {
    nombres: string;
    apellidos: string;
  };
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
  stockStatus: string;
  movimientosCount: number;
  movimientos: Movimiento[];
  activo: boolean;
}

export function ProductoDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [stockDialog, setStockDialog] = useState<{
    open: boolean;
    tipo: 'entrada' | 'salida';
  }>({ open: false, tipo: 'entrada' });
  const [stockForm, setStockForm] = useState({
    cantidad: '',
    bodegaId: '',
    observaciones: '',
  });

  useEffect(() => {
    if (id) {
      fetchProducto();
      fetchBodegas();
    }
  }, [id]);

  const fetchProducto = async () => {
    try {
      const response = await api.get(`/productos/${id}`);
      setProducto(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar producto',
        variant: 'destructive',
      });
      navigate('/inventario/productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchBodegas = async () => {
    try {
      const response = await api.get('/bodegas');
      setBodegas(response.data.data.filter((b: Bodega) => b.activo));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar bodegas',
        variant: 'destructive',
      });
    }
  };

  const handleAdjustStock = async () => {
    if (!producto || !stockForm.cantidad || !stockForm.bodegaId) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.post(`/productos/${producto.id}/adjust-stock`, {
        cantidad: Number(stockForm.cantidad),
        tipo: stockDialog.tipo,
        bodegaId: stockForm.bodegaId,
        observaciones: stockForm.observaciones,
      });

      toast({
        title: 'Éxito',
        description: `Stock ajustado correctamente (${stockDialog.tipo})`,
      });

      setStockDialog({ open: false, tipo: 'entrada' });
      setStockForm({ cantidad: '', bodegaId: '', observaciones: '' });
      fetchProducto();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al ajustar stock',
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
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'bajo':
        return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      case 'medio':
        return <Minus className="h-5 w-5 text-blue-500" />;
      case 'optimo':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!producto) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inventario/productos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{producto.nombre}</h1>
            <p className="text-muted-foreground">Detalles del producto</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/inventario/productos/${id}/editar`)}>
            Editar Producto
          </Button>
          <Button onClick={() => setStockDialog({ open: true, tipo: 'entrada' })}>
            <Plus className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button variant="outline" onClick={() => setStockDialog({ open: true, tipo: 'salida' })}>
            <Minus className="mr-2 h-4 w-4" />
            Salida
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-medium">{producto.codigo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoría</p>
                <Badge variant="outline">{producto.categoria.nombre}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unidad de Medida</p>
                <Badge variant="secondary">{producto.unidadMedida.abreviatura}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perecedero</p>
                <Badge variant={producto.perecedero ? 'warning' : 'success'}>
                  {producto.perecedero ? 'Sí' : 'No'}
                </Badge>
              </div>
              {producto.fechaVencimiento && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="font-medium">{new Date(producto.fechaVencimiento).toLocaleDateString('es-ES')}</p>
                </div>
              )}
            </div>
            {producto.descripcion && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{producto.descripcion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                {getStockIcon(producto.stockStatus)}
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{producto.stockActual}</p>
                <p className="text-sm text-muted-foreground">Stock Actual</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">{producto.stockMinimo}</p>
                <p className="text-sm text-muted-foreground">Stock Mínimo</p>
              </div>
              <div className="text-center">
                {getStockStatusBadge(producto.stockStatus)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Movimientos</span>
                <Badge variant="outline">{producto.movimientosCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado</span>
                <Badge variant={producto.activo ? 'success' : 'destructive'}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {producto.movimientos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay movimientos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producto.movimientos.map((movimiento) => (
                  <TableRow key={movimiento.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(movimiento.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={movimiento.tipo === 'entrada' ? 'success' : 'destructive'}>
                        {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{movimiento.cantidad}</TableCell>
                    <TableCell>{movimiento.bodega.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {movimiento.registradoPor.nombres} {movimiento.registradoPor.apellidos}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {movimiento.observaciones || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={stockDialog.open} onOpenChange={(open) => setStockDialog({ ...stockDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockDialog.tipo === 'entrada' ? 'Entrada de Stock' : 'Salida de Stock'}
            </DialogTitle>
            <DialogDescription>
              {stockDialog.tipo === 'entrada' 
                ? 'Registre una entrada de stock para este producto'
                : 'Registre una salida de stock para este producto'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                placeholder="Cantidad"
                value={stockForm.cantidad}
                onChange={(e) => setStockForm({ ...stockForm, cantidad: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodegaId">Bodega *</Label>
              <Select value={stockForm.bodegaId} onValueChange={(value) => setStockForm({ ...stockForm, bodegaId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una bodega" />
                </SelectTrigger>
                <SelectContent>
                  {bodegas.map((bodega) => (
                    <SelectItem key={bodega.id} value={bodega.id}>
                      {bodega.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input
                id="observaciones"
                placeholder="Observaciones del movimiento"
                value={stockForm.observaciones}
                onChange={(e) => setStockForm({ ...stockForm, observaciones: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog({ open: false, tipo: 'entrada' })}>
              Cancelar
            </Button>
            <Button onClick={handleAdjustStock}>
              {stockDialog.tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
