import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  activo: boolean;
  fechaRegistro: string;
  ultimoAcceso: string | null;
  roles: { id: string; codigo: string; nombre: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UsuariosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  });

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) params.append('search', search);

      const response = await api.get(`/usuarios?${params}`);
      setUsuarios(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [pagination.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsuarios();
  };

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      await api.patch(`/usuarios/${usuario.id}/toggle-active`);
      toast({
        title: 'Éxito',
        description: `Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`,
      });
      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.usuario) return;

    try {
      await api.delete(`/usuarios/${deleteDialog.usuario.id}`);
      toast({
        title: 'Éxito',
        description: 'Usuario eliminado correctamente',
      });
      setDeleteDialog({ open: false, usuario: null });
      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar usuario',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        <Button onClick={() => navigate('/seguridad/usuarios/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">
                    {usuario.nombres} {usuario.apellidos}
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.celular}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {usuario.roles.map((rol) => (
                        <Badge key={rol.id} variant="secondary">
                          {rol.nombre}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.activo ? 'success' : 'destructive'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/seguridad/usuarios/${usuario.id}`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(usuario)}
                        title={usuario.activo ? 'Desactivar' : 'Activar'}
                      >
                        {usuario.activo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/seguridad/usuarios/${usuario.id}/password`)}
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, usuario })}
                        title="Eliminar"
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

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {usuarios.length} de {pagination.total} usuarios
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, usuario: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar al usuario{' '}
              <strong>
                {deleteDialog.usuario?.nombres} {deleteDialog.usuario?.apellidos}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, usuario: null })}>
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
