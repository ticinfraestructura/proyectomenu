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

const unidadSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  abreviatura: z.string().min(1, 'Mínimo 1 caracter').max(10),
});

type UnidadFormData = z.infer<typeof unidadSchema>;

export function UnidadFormPage() {
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
  } = useForm<UnidadFormData>({
    resolver: zodResolver(unidadSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      abreviatura: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchUnidad();
    }
  }, [id]);

  const fetchUnidad = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/unidades/${id}`);
      const unidad = response.data.data;
      setValue('codigo', unidad.codigo);
      setValue('nombre', unidad.nombre);
      setValue('abreviatura', unidad.abreviatura);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar unidad de medida',
        variant: 'destructive',
      });
      navigate('/configuracion/unidades');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UnidadFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/unidades/${id}`, data);
        toast({
          title: 'Éxito',
          description: 'Unidad de medida actualizada correctamente',
        });
      } else {
        await api.post('/unidades', data);
        toast({
          title: 'Éxito',
          description: 'Unidad de medida creada correctamente',
        });
      }
      navigate('/configuracion/unidades');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar unidad de medida',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/configuracion/unidades')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos de la unidad de medida' : 'Complete los datos de la nueva unidad de medida'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Información de la Unidad de Medida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input id="codigo" {...register('codigo')} placeholder="Ej: UNIDAD" />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Ej: Unidad" />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abreviatura">Abreviatura *</Label>
              <Input id="abreviatura" {...register('abreviatura')} placeholder="Ej: UN" />
              {errors.abreviatura && (
                <p className="text-sm text-red-500">{errors.abreviatura.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Abreviatura corta para mostrar en listados y reportes
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/configuracion/unidades')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Unidad
          </Button>
        </div>
      </form>
    </div>
  );
}
