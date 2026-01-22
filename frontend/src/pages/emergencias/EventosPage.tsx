import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertTriangle, Eye, XCircle } from 'lucide-react';
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

interface TipoDesastre {
  id: string;
  codigo: string;
  nombre: string;
}

interface EventoEmergencia {
  id: string;
  nombre: string;
  tipoDesastre: TipoDesastre;
  fechaInicio: string;
  fechaFin: string | null;
  departamento: string;
  municipio: string;
  estado: string;
  descripcion: string | null;
  zonasCount: number;
  entregasCount: number;
  actasCount: number;
  createdAt: string;
}

export function EventosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventos, setEventos] = useState<EventoEmergencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; evento: EventoEmergencia | null }>({
    open: false,
    evento: null,
  });

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/eventos?includeInactive=true');
      setEventos(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.evento) return;

    try {
      await api.delete(`/eventos/${deleteDialog.evento.id}`);
      toast({
        title: 'Éxito',
        description: 'Evento eliminado correctamente',
      });
      setDeleteDialog({ open: false, evento: null });
      fetchEventos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar evento',
        variant: 'destructive',
      });
    }
  };

  const handleCerrarEvento = async (evento: EventoEmergencia) => {
    try {
      await api.patch(`/eventos/${evento.id}/cerrar`);
      toast({
        title: 'Éxito',
        description: 'Evento cerrado correctamente',
      });
      fetchEventos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cerrar evento',
        variant: 'destructive',
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge variant="success">Activo</Badge>;
      case 'cerrado':
        return <Badge variant="destructive">Cerrado</Badge>;
      case 'suspendido':
        return <Badge variant="warning">Suspendido</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos de Emergencia</h1>
          <p className="text-muted-foreground">Gestión de eventos de desastre</p>
        </div>
        <Button onClick={() => navigate('/emergencias/eventos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Zonas</TableHead>
              <TableHead>Entregas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : eventos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No se encontraron eventos
                </TableCell>
              </TableRow>
            ) : (
              eventos.map((evento) => (
                <TableRow key={evento.id}>
                  <TableCell className="font-medium">{evento.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>{evento.tipoDesastre.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{evento.departamento}</div>
                      <div className="text-muted-foreground">{evento.municipio}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(evento.fechaInicio)}</TableCell>
                  <TableCell>{formatDate(evento.fechaFin)}</TableCell>
                  <TableCell>{getEstadoBadge(evento.estado)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{evento.zonasCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{evento.entregasCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/emergencias/eventos/${evento.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/emergencias/eventos/${evento.id}/editar`)}
                        title="Editar"
                        disabled={evento.estado === 'cerrado'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCerrarEvento(evento)}
                        title="Cerrar evento"
                        disabled={evento.estado === 'cerrado'}
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, evento })}
                        title="Eliminar"
                        disabled={evento.zonasCount > 0 || evento.entregasCount > 0}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, evento: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el evento{' '}
              <strong>{deleteDialog.evento?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, evento: null })}>
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
