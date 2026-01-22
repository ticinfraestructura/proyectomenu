import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, MapPin, Users, Package, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/useToast';

interface TipoDesastre {
  id: string;
  codigo: string;
  nombre: string;
}

interface ZonaAfectada {
  id: string;
  nombre: string;
  coordenadas: string | null;
  nivelAfectacion: string;
  poblacionEstimada: number | null;
  descripcion: string | null;
  familiasCount: number;
  personasCount: number;
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
  zonasAfectadas: ZonaAfectada[];
}

export function EventoDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [evento, setEvento] = useState<EventoEmergencia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvento();
    }
  }, [id]);

  const fetchEvento = async () => {
    try {
      const response = await api.get(`/eventos/${id}`);
      setEvento(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar evento',
        variant: 'destructive',
      });
      navigate('/emergencias/eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarEvento = async () => {
    try {
      await api.patch(`/eventos/${id}/cerrar`);
      toast({
        title: 'Éxito',
        description: 'Evento cerrado correctamente',
      });
      fetchEvento();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!evento) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/emergencias/eventos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{evento.nombre}</h1>
            <p className="text-muted-foreground">Detalles del evento de emergencia</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/emergencias/eventos/${id}/editar`)}
            disabled={evento.estado === 'cerrado'}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {evento.estado === 'activo' && (
            <Button variant="destructive" onClick={handleCerrarEvento}>
              Cerrar Evento
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Desastre</p>
                <p className="font-medium">{evento.tipoDesastre.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                {getEstadoBadge(evento.estado)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">{evento.departamento}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Municipio</p>
                <p className="font-medium">{evento.municipio}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                <p className="font-medium">{formatDate(evento.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha Fin</p>
                <p className="font-medium">{formatDate(evento.fechaFin)}</p>
              </div>
            </div>
            {evento.descripcion && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{evento.descripcion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Zonas Afectadas</span>
                </div>
                <Badge variant="outline">{evento.zonasCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Entregas Realizadas</span>
                </div>
                <Badge variant="outline">{evento.entregasCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Actas Generadas</span>
                </div>
                <Badge variant="outline">{evento.actasCount}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/emergencias/zonas/nuevo?eventoId=${id}`)}
                disabled={evento.estado === 'cerrado'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Zona
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/entregas/registro?eventoId=${id}`)}
                disabled={evento.estado === 'cerrado'}
              >
                <Package className="mr-2 h-4 w-4" />
                Registrar Entrega
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Zonas Afectadas</CardTitle>
            <Button
              onClick={() => navigate(`/emergencias/zonas/nuevo?eventoId=${id}`)}
              disabled={evento.estado === 'cerrado'}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Zona
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {evento.zonasAfectadas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay zonas afectadas registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nivel Afectación</TableHead>
                  <TableHead>Población</TableHead>
                  <TableHead>Familias</TableHead>
                  <TableHead>Personas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evento.zonasAfectadas.map((zona) => (
                  <TableRow key={zona.id}>
                    <TableCell className="font-medium">{zona.nombre}</TableCell>
                    <TableCell>{getNivelAfectacionBadge(zona.nivelAfectacion)}</TableCell>
                    <TableCell>{zona.poblacionEstimada || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{zona.familiasCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{zona.personasCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/emergencias/zonas/${zona.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
