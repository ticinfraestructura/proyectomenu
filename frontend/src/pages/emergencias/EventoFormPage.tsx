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

const eventoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  tipoDesastreId: z.string().min(1, 'Seleccione un tipo de desastre'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().optional(),
  departamento: z.string().min(1, 'El departamento es requerido'),
  municipio: z.string().min(1, 'El municipio es requerido'),
  descripcion: z.string().optional(),
});

type EventoFormData = z.infer<typeof eventoSchema>;

interface TipoDesastre {
  id: string;
  codigo: string;
  nombre: string;
}

export function EventoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [tiposDesastre, setTiposDesastre] = useState<TipoDesastre[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      nombre: '',
      tipoDesastreId: '',
      fechaInicio: '',
      fechaFin: '',
      departamento: '',
      municipio: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    fetchTiposDesastre();
    if (isEditing) {
      fetchEvento();
    }
  }, [id]);

  const fetchTiposDesastre = async () => {
    try {
      const response = await api.get('/tipos-desastre');
      setTiposDesastre(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar tipos de desastre',
        variant: 'destructive',
      });
    }
  };

  const fetchEvento = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/eventos/${id}`);
      const evento = response.data.data;
      setValue('nombre', evento.nombre);
      setValue('tipoDesastreId', evento.tipoDesastreId);
      setValue('fechaInicio', evento.fechaInicio.split('T')[0]);
      setValue('fechaFin', evento.fechaFin ? evento.fechaFin.split('T')[0] : '');
      setValue('departamento', evento.departamento);
      setValue('municipio', evento.municipio);
      setValue('descripcion', evento.descripcion || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar evento',
        variant: 'destructive',
      });
      navigate('/emergencias/eventos');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: EventoFormData) => {
    setLoading(true);
    try {
      const submitData = {
        ...data,
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString() : null,
      };

      if (isEditing) {
        await api.put(`/eventos/${id}`, submitData);
        toast({
          title: 'Éxito',
          description: 'Evento actualizado correctamente',
        });
      } else {
        await api.post('/eventos', submitData);
        toast({
          title: 'Éxito',
          description: 'Evento creado correctamente',
        });
      }
      navigate('/emergencias/eventos');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar evento',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/emergencias/eventos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Evento de Emergencia' : 'Nuevo Evento de Emergencia'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos del evento' : 'Complete los datos del nuevo evento'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Evento *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Ej: Huracán María - Zona Norte" />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipoDesastreId">Tipo de Desastre *</Label>
                  <select
                    id="tipoDesastreId"
                    {...register('tipoDesastreId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccione...</option>
                    {tiposDesastre.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.tipoDesastreId && (
                    <p className="text-sm text-red-500">{errors.tipoDesastreId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input id="descripcion" {...register('descripcion')} placeholder="Descripción del evento" />
                  {errors.descripcion && (
                    <p className="text-sm text-red-500">{errors.descripcion.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                <Input id="fechaInicio" type="date" {...register('fechaInicio')} />
                {errors.fechaInicio && (
                  <p className="text-sm text-red-500">{errors.fechaInicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin (opcional)</Label>
                <Input id="fechaFin" type="date" {...register('fechaFin')} />
                {errors.fechaFin && (
                  <p className="text-sm text-red-500">{errors.fechaFin.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input id="departamento" {...register('departamento')} placeholder="Ej: Guatemala" />
                {errors.departamento && (
                  <p className="text-sm text-red-500">{errors.departamento.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">Municipio *</Label>
                <Input id="municipio" {...register('municipio')} placeholder="Ej: Guatemala City" />
                {errors.municipio && (
                  <p className="text-sm text-red-500">{errors.municipio.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/emergencias/eventos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Evento
          </Button>
        </div>
      </form>
    </div>
  );
}
