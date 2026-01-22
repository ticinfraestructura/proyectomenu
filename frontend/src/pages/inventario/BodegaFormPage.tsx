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
import { useToast } from '@/hooks/useToast';

const bodegaSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  capacidad: z.number().min(1, 'La capacidad debe ser mayor a 0').optional(),
  responsableNombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  responsableEmail: z.string().email('Email inválido'),
  responsableCelular: z.string().min(7, 'El celular debe tener al menos 7 caracteres').max(20),
});

type BodegaFormData = z.infer<typeof bodegaSchema>;

export function BodegaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BodegaFormData>({
    resolver: zodResolver(bodegaSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      direccion: '',
      capacidad: undefined,
      responsableNombre: '',
      responsableEmail: '',
      responsableCelular: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchBodega();
    }
  }, [id]);

  const fetchBodega = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/bodegas/${id}`);
      const bodega = response.data.data;
      setValue('codigo', bodega.codigo);
      setValue('nombre', bodega.nombre);
      setValue('direccion', bodega.direccion);
      setValue('capacidad', bodega.capacidad || undefined);
      setValue('responsableNombre', bodega.responsableNombre);
      setValue('responsableEmail', bodega.responsableEmail);
      setValue('responsableCelular', bodega.responsableCelular);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar bodega',
        variant: 'destructive',
      });
      navigate('/inventario/bodegas');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: BodegaFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/bodegas/${id}`, data);
        toast({
          title: 'Éxito',
          description: 'Bodega actualizada correctamente',
        });
      } else {
        await api.post('/bodegas', data);
        toast({
          title: 'Éxito',
          description: 'Bodega creada correctamente',
        });
      }
      navigate('/inventario/bodegas');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar bodega',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventario/bodegas')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Bodega' : 'Nueva Bodega'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos de la bodega' : 'Complete los datos de la nueva bodega'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información de la Bodega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input id="codigo" {...register('codigo')} placeholder="Ej: BODEGA_CENTRAL" />
                  {errors.codigo && (
                    <p className="text-sm text-red-500">{errors.codigo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" {...register('nombre')} placeholder="Ej: Bodega Central" />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input id="direccion" {...register('direccion')} placeholder="Ej: Zona 1, Ciudad de Guatemala" />
                {errors.direccion && (
                  <p className="text-sm text-red-500">{errors.direccion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad (opcional)</Label>
                <Input
                  id="capacidad"
                  type="number"
                  {...register('capacidad', { valueAsNumber: true })}
                  placeholder="Ej: 10000"
                />
                {errors.capacidad && (
                  <p className="text-sm text-red-500">{errors.capacidad.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Capacidad máxima en unidades. Deje en blanco si no hay límite.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Responsable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="responsableNombre">Nombre del Responsable *</Label>
                <Input id="responsableNombre" {...register('responsableNombre')} placeholder="Ej: Juan Pérez" />
                {errors.responsableNombre && (
                  <p className="text-sm text-red-500">{errors.responsableNombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsableEmail">Email del Responsable *</Label>
                <Input
                  id="responsableEmail"
                  type="email"
                  {...register('responsableEmail')}
                  placeholder="Ej: juan@ejemplo.com"
                />
                {errors.responsableEmail && (
                  <p className="text-sm text-red-500">{errors.responsableEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsableCelular">Celular del Responsable *</Label>
                <Input
                  id="responsableCelular"
                  {...register('responsableCelular')}
                  placeholder="Ej: 5555-1234"
                />
                {errors.responsableCelular && (
                  <p className="text-sm text-red-500">{errors.responsableCelular.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/inventario/bodegas')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Bodega
          </Button>
        </div>
      </form>
    </div>
  );
}
