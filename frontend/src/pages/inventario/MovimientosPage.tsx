import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, Warehouse, User, Filter } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: {
    nombre: string;
  };
  unidadMedida: {
    abreviatura: string;
  };
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
  producto: Producto;
  bodega: Bodega;
  registradoPor: {
    nombres: string;
    apellidos: string;
  };
}

export function MovimientosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    productoId: '',
    bodegaId: '',
  });

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.productoId) params.append('productoId', filters.productoId);
      if (filters.bodegaId) params.append('bodegaId', filters.bodegaId);
      
      const response = await api.get(`/movimientos?${params.toString()}`);
      setMovimientos(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar movimientos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar productos',
        variant: 'destructive',
      });
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

  useEffect(() => {
    fetchProductos();
    fetchBodegas();
  }, []);

  useEffect(() => {
    fetchMovimientos();
  }, [filters]);

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <Badge variant="success">Entrada</Badge>;
      case 'salida':
        return <Badge variant="destructive">Salida</Badge>;
      default:
        return <Badge variant="secondary">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">Historial de entradas y salidas</p>
        </div>
        <Button onClick={() => navigate('/inventario/productos')}>
          <Package className="mr-2 h-4 w-4" />
          Gestionar Productos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="salida">Salidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select value={filters.productoId} onValueChange={(value) => setFilters({ ...filters, productoId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los productos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los productos</SelectItem>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select value={filters.bodegaId} onValueChange={(value) => setFilters({ ...filters, bodegaId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las bodegas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las bodegas</SelectItem>
                  {bodegas.map((bodega) => (
                    <SelectItem key={bodega.id} value={bodega.id}>
                      {bodega.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Bodega</TableHead>
              <TableHead>Registrado por</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : movimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron movimientos
                </TableCell>
              </TableRow>
            ) : (
              movimientos.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(movimiento.fecha).toLocaleDateString('es-ES')}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(movimiento.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getTipoBadge(movimiento.tipo)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{movimiento.producto.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        <code className="text-xs">{movimiento.producto.codigo}</code>
                        <span className="mx-1">•</span>
                        <Badge variant="outline" className="text-xs">
                          {movimiento.producto.categoria.nombre}
                        </Badge>
                        <span className="mx-1">•</span>
                        <span className="text-xs">{movimiento.producto.unidadMedida.abreviatura}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{movimiento.cantidad}</span>
                      <span className="text-sm text-muted-foreground">
                        {movimiento.producto.unidadMedida.abreviatura}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <span>{movimiento.bodega.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {movimiento.registradoPor.nombres} {movimiento.registradoPor.apellidos}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm truncate block" title={movimiento.observaciones || ''}>
                      {movimiento.observaciones || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total: {movimientos.length} movimientos</span>
        <div className="flex gap-4">
          <span>
            Entradas: {movimientos.filter(m => m.tipo === 'entrada').length}
          </span>
          <span>
            Salidas: {movimientos.filter(m => m.tipo === 'salida').length}
          </span>
        </div>
      </div>
    </div>
  );
}
