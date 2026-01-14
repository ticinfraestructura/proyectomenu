import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
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

interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
}

interface Rol {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  permisos: Permiso[];
  usuariosCount: number;
}

export function RolesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; rol: Rol | null }>({
    open: false,
    rol: null,
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/roles?includeInactive=true');
      setRoles(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar roles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.rol) return;

    try {
      await api.delete(`/roles/${deleteDialog.rol.id}`);
      toast({
        title: 'Éxito',
        description: 'Rol eliminado correctamente',
      });
      setDeleteDialog({ open: false, rol: null });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar rol',
        variant: 'destructive',
      });
    }
  };

  const getModulosUnicos = (permisos: Permiso[]) => {
    const modulos = [...new Set(permisos.map((p) => p.modulo))];
    return modulos.slice(0, 3).join(', ') + (modulos.length > 3 ? '...' : '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Gestión de roles y permisos del sistema</p>
        </div>
        <Button onClick={() => navigate('/seguridad/roles/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No se encontraron roles
                </TableCell>
              </TableRow>
            ) : (
              roles.map((rol) => (
                <TableRow key={rol.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <code className="text-sm">{rol.codigo}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{rol.nombre}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {rol.descripcion || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getModulosUnicos(rol.permisos)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rol.permisos.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rol.usuariosCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rol.activo ? 'success' : 'destructive'}>
                      {rol.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/seguridad/roles/${rol.id}`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, rol })}
                        title="Eliminar"
                        disabled={rol.usuariosCount > 0}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, rol: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el rol{' '}
              <strong>{deleteDialog.rol?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, rol: null })}>
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
