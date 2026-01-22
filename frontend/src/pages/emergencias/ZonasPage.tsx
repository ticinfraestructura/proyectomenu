import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, AlertTriangle } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';

interface EventoEmergencia {
  id: string;
  nombre: string;
  estado: string;
}

interface ZonaAfectada {
  id: string;
  nombre: string;
  eventoEmergencia: EventoEmergencia;
  coordenadas: string | null;
  nivelAfectacion: string;
  poblacionEstimada: number | null;
  descripcion: string | null;
  familiasCount: number;
  personasCount: number;
}

export function ZonasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [zonas, setZonas] = useState<ZonaAfectada[]>([]);
  const [eventos, setEventos] = useState<EventoEmergencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; zona: ZonaAfectada | null }>({
    open: false,
    zona: null,
  });
  const [selectedEvento, setSelectedEvento] = useState<string>('');

  useEffect(() => {
    const eventoId = searchParams.get('eventoId');
    if (eventoId) {
      setSelectedEvento(eventoId);
    }
    fetchEventos();
    fetchZonas();
  }, [searchParams]);

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

  const fetchZonas = async () => {
    setLoading(true);
    try {
      const eventoId = searchParams.get('eventoId');
      const url = eventoId ? `/zonas?eventoId=${eventoId}` : '/zonas';
      const response = await api.get(url);
      setZonas(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar zonas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.zona) return;

    try {
      await api.delete(`/zonas/${deleteDialog.zona.id}`);
      toast({
        title: 'Éxito',
        description: 'Zona eliminada correctamente',
      });
      setDeleteDialog({ open: false, zona: null });
      fetchZonas();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar zona',
        variant: 'destructive',
      });
    }
  };

  const getNivelAfectacionBadge = (nivel: string) => {
    switch (nivel) {
      case 'alto':
        return <Badge variant="destructive">Alto</Badge>;
      case 'medio':
        return <Badge variant="warning">Medio</Badge>;
      case 'bajo':
        return <Badge variant="success">Bajo</Badge>;
      default:
        return <Badge variant="secondary">{nivel}</Badge>;
    }
  };

  const getEventoBadge = (evento: EventoEmergencia) => {
    switch (evento.estado) {
      case 'activo':
        return <Badge variant="success">{evento.nombre}</Badge>;
      case 'cerrado':
        return <Badge variant="destructive">{evento.nombre}</Badge>;
      case 'suspendido':
        return <Badge variant="warning">{evento.nombre}</Badge>;
      default:
        return <Badge variant="secondary">{evento.nombre}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zonas Afectadas</h1>
          <p className="text-muted-foreground">Gestión de zonas afectadas por emergencias</p>
        </div>
        <Button onClick={() => navigate(`/emergencias/zonas/nuevo${selectedEvento ? `?eventoId=${selectedEvento}` : ''}`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Zona
        </Button>
      </div>

      {eventos.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filtrar por evento:</label>
          <select
            value={selectedEvento}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                navigate(`/emergencias/zonas?eventoId=${value}`);
              } else {
                navigate('/emergencias/zonas');
              }
            }}
            className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">Todos los eventos</option>
            {eventos.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Nivel Afectación</TableHead>
              <TableHead>Población</TableHead>
              <TableHead>Familias</TableHead>
              <TableHead>Personas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : zonas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {selectedEvento ? 'No hay zonas afectadas para este evento' : 'No se encontraron zonas afectadas'}
                </TableCell>
              </TableRow>
            ) : (
              zonas.map((zona) => (
                <TableRow key={zona.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      {zona.nombre}
                    </div>
                  </TableCell>
                  <TableCell>{getEventoBadge(zona.eventoEmergencia)}</TableCell>
                  <TableCell>{getNivelAfectacionBadge(zona.nivelAfectacion)}</TableCell>
                  <TableCell>
                    {zona.poblacionEstimada ? zona.poblacionEstimada.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{zona.familiasCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{zona.personasCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/emergencias/zonas/${zona.id}`)}
                        title="Ver detalles"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/emergencias/zonas/${zona.id}/editar`)}
                        title="Editar"
                        disabled={zona.eventoEmergencia.estado === 'cerrado'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, zona })}
                        title="Eliminar"
                        disabled={zona.familiasCount > 0 || zona.eventoEmergencia.estado === 'cerrado'}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, zona: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar la zona afectada{' '}
              <strong>{deleteDialog.zona?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, zona: null })}>
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
