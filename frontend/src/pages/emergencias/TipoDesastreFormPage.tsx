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

const tipoDesastreSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  descripcion: z.string().optional(),
});

type TipoDesastreFormData = z.infer<typeof tipoDesastreSchema>;

export function TipoDesastreFormPage() {
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
  } = useForm<TipoDesastreFormData>({
    resolver: zodResolver(tipoDesastreSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchTipo();
    }
  }, [id]);

  const fetchTipo = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/tipos-desastre/${id}`);
      const tipo = response.data.data;
      setValue('codigo', tipo.codigo);
      setValue('nombre', tipo.nombre);
      setValue('descripcion', tipo.descripcion || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar tipo de desastre',
        variant: 'destructive',
      });
      navigate('/emergencias/tipos');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: TipoDesastreFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/tipos-desastre/${id}`, data);
        toast({
          title: 'Éxito',
          description: 'Tipo de desastre actualizado correctamente',
        });
      } else {
        await api.post('/tipos-desastre', data);
        toast({
          title: 'Éxito',
          description: 'Tipo de desastre creado correctamente',
        });
      }
      navigate('/emergencias/tipos');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar tipo de desastre',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/emergencias/tipos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Tipo de Desastre' : 'Nuevo Tipo de Desastre'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos del tipo de desastre' : 'Complete los datos del nuevo tipo de desastre'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Información del Tipo de Desastre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input id="codigo" {...register('codigo')} placeholder="Ej: HURACAN" />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Ej: Huracán" />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" {...register('descripcion')} placeholder="Descripción detallada del tipo de desastre" />
              {errors.descripcion && (
                <p className="text-sm text-red-500">{errors.descripcion.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/emergencias/tipos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Tipo
          </Button>
        </div>
      </form>
    </div>
  );
}
