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

const categoriaSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  descripcion: z.string().optional(),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

export function CategoriaFormPage() {
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
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchCategoria();
    }
  }, [id]);

  const fetchCategoria = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/categorias/${id}`);
      const categoria = response.data.data;
      setValue('codigo', categoria.codigo);
      setValue('nombre', categoria.nombre);
      setValue('descripcion', categoria.descripcion || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar categoría',
        variant: 'destructive',
      });
      navigate('/configuracion/categorias');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: CategoriaFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/categorias/${id}`, data);
        toast({
          title: 'Éxito',
          description: 'Categoría actualizada correctamente',
        });
      } else {
        await api.post('/categorias', data);
        toast({
          title: 'Éxito',
          description: 'Categoría creada correctamente',
        });
      }
      navigate('/configuracion/categorias');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar categoría',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/configuracion/categorias')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos de la categoría' : 'Complete los datos de la nueva categoría'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Información de la Categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input id="codigo" {...register('codigo')} placeholder="Ej: ALIMENTOS" />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Ej: Alimentos" />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" {...register('descripcion')} placeholder="Descripción detallada de la categoría" />
              {errors.descripcion && (
                <p className="text-sm text-red-500">{errors.descripcion.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/configuracion/categorias')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Categoría
          </Button>
        </div>
      </form>
    </div>
  );
}
