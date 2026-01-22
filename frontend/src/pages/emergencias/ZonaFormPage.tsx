import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

const zonaSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  eventoEmergenciaId: z.string().min(1, 'Seleccione un evento'),
  coordenadas: z.string().optional(),
  nivelAfectacion: z.string().min(1, 'Seleccione el nivel de afectación'),
  poblacionEstimada: z.number().min(0, 'La población debe ser mayor o igual a 0').optional(),
  descripcion: z.string().optional(),
});

type ZonaFormData = z.infer<typeof zonaSchema>;

interface EventoEmergencia {
  id: string;
  nombre: string;
  estado: string;
}

export function ZonaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [eventos, setEventos] = useState<EventoEmergencia[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ZonaFormData>({
    resolver: zodResolver(zonaSchema),
    defaultValues: {
      nombre: '',
      eventoEmergenciaId: '',
      coordenadas: '',
      nivelAfectacion: '',
      poblacionEstimada: undefined,
      descripcion: '',
    },
  });

  useEffect(() => {
    fetchEventos();
    if (isEditing) {
      fetchZona();
    } else {
      const eventoId = searchParams.get('eventoId');
      if (eventoId) {
        setValue('eventoEmergenciaId', eventoId);
      }
    }
  }, [id, searchParams]);

  const fetchEventos = async () => {
    try {
      const response = await api.get('/eventos');
      setEventos(response.data.data.filter((e: EventoEmergencia) => e.estado === 'activo'));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar eventos',
        variant: 'destructive',
      });
    }
  };

  const fetchZona = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/zonas/${id}`);
      const zona = response.data.data;
      setValue('nombre', zona.nombre);
      setValue('eventoEmergenciaId', zona.eventoEmergenciaId);
      setValue('coordenadas', zona.coordenadas || '');
      setValue('nivelAfectacion', zona.nivelAfectacion);
      setValue('poblacionEstimada', zona.poblacionEstimada || undefined);
      setValue('descripcion', zona.descripcion || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar zona',
        variant: 'destructive',
      });
      navigate('/emergencias/zonas');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ZonaFormData) => {
    setLoading(true);
    try {
      const submitData = {
        ...data,
        poblacionEstimada: data.poblacionEstimada ? Number(data.poblacionEstimada) : null,
      };

      if (isEditing) {
        await api.put(`/zonas/${id}`, submitData);
        toast({
          title: 'Éxito',
          description: 'Zona actualizada correctamente',
        });
      } else {
        await api.post('/zonas', submitData);
        toast({
          title: 'Éxito',
          description: 'Zona creada correctamente',
        });
      }
      navigate('/emergencias/zonas');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar zona',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/emergencias/zonas')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Zona Afectada' : 'Nueva Zona Afectada'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos de la zona' : 'Complete los datos de la nueva zona'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información de la Zona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Zona *</Label>
                  <Input id="nombre" {...register('nombre')} placeholder="Ej: Zona Norte - Sector 1" />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventoEmergenciaId">Evento de Emergencia *</Label>
                  <select
                    id="eventoEmergenciaId"
                    {...register('eventoEmergenciaId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isEditing}
                  >
                    <option value="">Seleccione...</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.eventoEmergenciaId && (
                    <p className="text-sm text-red-500">{errors.eventoEmergenciaId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" {...register('descripcion')} placeholder="Descripción detallada de la zona" />
                {errors.descripcion && (
                  <p className="text-sm text-red-500">{errors.descripcion.message}</p>
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
                <Label htmlFor="coordenadas">Coordenadas (opcional)</Label>
                <Input id="coordenadas" {...register('coordenadas')} placeholder="Ej: 14.6349, -90.5069" />
                {errors.coordenadas && (
                  <p className="text-sm text-red-500">{errors.coordenadas.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: latitud, longitud (ej: 14.6349, -90.5069)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nivelAfectacion">Nivel de Afectación *</Label>
                <select
                  id="nivelAfectacion"
                  {...register('nivelAfectacion')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione...</option>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
                {errors.nivelAfectacion && (
                  <p className="text-sm text-red-500">{errors.nivelAfectacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="poblacionEstimada">Población Estimada (opcional)</Label>
                <Input
                  id="poblacionEstimada"
                  type="number"
                  {...register('poblacionEstimada', { valueAsNumber: true })}
                  placeholder="Ej: 1000"
                />
                {errors.poblacionEstimada && (
                  <p className="text-sm text-red-500">{errors.poblacionEstimada.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/emergencias/zonas')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Zona
          </Button>
        </div>
      </form>
    </div>
  );
}
