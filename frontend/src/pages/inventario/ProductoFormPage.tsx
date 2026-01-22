import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/useToast';

const productoSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  categoriaId: z.string().min(1, 'Seleccione una categoría'),
  unidadMedidaId: z.string().min(1, 'Seleccione una unidad de medida'),
  stockMinimo: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  stockActual: z.number().min(0, 'El stock actual debe ser mayor o igual a 0'),
  perecedero: z.boolean(),
  fechaVencimiento: z.string().optional(),
  descripcion: z.string().optional(),
});

type ProductoFormData = z.infer<typeof productoSchema>;

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

export function ProductoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      categoriaId: '',
      unidadMedidaId: '',
      stockMinimo: 0,
      stockActual: 0,
      perecedero: false,
      fechaVencimiento: '',
      descripcion: '',
    },
  });

  const perecedero = watch('perecedero');

  useEffect(() => {
    fetchCategorias();
    fetchUnidadesMedida();
    if (isEditing) {
      fetchProducto();
    }
  }, [id]);

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

  const fetchUnidadesMedida = async () => {
    try {
      const response = await api.get('/unidades');
      setUnidadesMedida(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar unidades de medida',
        variant: 'destructive',
      });
    }
  };

  const fetchProducto = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/productos/${id}`);
      const producto = response.data.data;
      setValue('codigo', producto.codigo);
      setValue('nombre', producto.nombre);
      setValue('categoriaId', producto.categoriaId);
      setValue('unidadMedidaId', producto.unidadMedidaId);
      setValue('stockMinimo', producto.stockMinimo);
      setValue('stockActual', producto.stockActual);
      setValue('perecedero', producto.perecedero);
      setValue('fechaVencimiento', producto.fechaVencimiento ? producto.fechaVencimiento.split('T')[0] : '');
      setValue('descripcion', producto.descripcion || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar producto',
        variant: 'destructive',
      });
      navigate('/inventario/productos');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ProductoFormData) => {
    setLoading(true);
    try {
      const submitData = {
        ...data,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento).toISOString() : null,
      };

      if (isEditing) {
        await api.put(`/productos/${id}`, submitData);
        toast({
          title: 'Éxito',
          description: 'Producto actualizado correctamente',
        });
      } else {
        await api.post('/productos', submitData);
        toast({
          title: 'Éxito',
          description: 'Producto creado correctamente',
        });
      }
      navigate('/inventario/productos');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar producto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventario/productos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos del producto' : 'Complete los datos del nuevo producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input id="codigo" {...register('codigo')} placeholder="Ej: AGUA_POTABLE" />
                  {errors.codigo && (
                    <p className="text-sm text-red-500">{errors.codigo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" {...register('nombre')} placeholder="Ej: Agua Potable Purificada" />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoriaId">Categoría *</Label>
                  <Select value={watch('categoriaId')} onValueChange={(value) => setValue('categoriaId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoriaId && (
                    <p className="text-sm text-red-500">{errors.categoriaId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadMedidaId">Unidad de Medida *</Label>
                  <Select value={watch('unidadMedidaId')} onValueChange={(value) => setValue('unidadMedidaId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesMedida.map((unidad) => (
                        <SelectItem key={unidad.id} value={unidad.id}>
                          {unidad.nombre} ({unidad.abreviatura})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unidadMedidaId && (
                    <p className="text-sm text-red-500">{errors.unidadMedidaId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" {...register('descripcion')} placeholder="Descripción detallada del producto" />
                {errors.descripcion && (
                  <p className="text-sm text-red-500">{errors.descripcion.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stockActual">Stock Actual *</Label>
                  <Input
                    id="stockActual"
                    type="number"
                    {...register('stockActual', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.stockActual && (
                    <p className="text-sm text-red-500">{errors.stockActual.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    {...register('stockMinimo', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.stockMinimo && (
                    <p className="text-sm text-red-500">{errors.stockMinimo.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propiedades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perecedero"
                  checked={perecedero}
                  onCheckedChange={(checked) => setValue('perecedero', checked as boolean)}
                />
                <Label htmlFor="perecedero">Producto Perecedero</Label>
              </div>

              {perecedero && (
                <div className="space-y-2">
                  <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                  <Input
                    id="fechaVencimiento"
                    type="date"
                    {...register('fechaVencimiento')}
                  />
                  {errors.fechaVencimiento && (
                    <p className="text-sm text-red-500">{errors.fechaVencimiento.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/inventario/productos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </div>
      </form>
    </div>
  );
}
