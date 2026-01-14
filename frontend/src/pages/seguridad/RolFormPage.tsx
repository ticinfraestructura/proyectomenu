import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
}

const rolSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  descripcion: z.string().optional(),
  permisos: z.array(z.string()),
});

type RolFormData = z.infer<typeof rolSchema>;

export function RolFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [permisosGrouped, setPermisosGrouped] = useState<Record<string, Permiso[]>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RolFormData>({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      permisos: [],
    },
  });

  const selectedPermisos = watch('permisos');

  useEffect(() => {
    fetchPermisos();
    if (isEditing) {
      fetchRol();
    }
  }, [id]);

  const fetchPermisos = async () => {
    try {
      const response = await api.get('/roles/permisos');
      setPermisosGrouped(response.data.data.grouped);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar permisos',
        variant: 'destructive',
      });
    }
  };

  const fetchRol = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/roles/${id}`);
      const rol = response.data.data;
      setValue('codigo', rol.codigo);
      setValue('nombre', rol.nombre);
      setValue('descripcion', rol.descripcion || '');
      setValue('permisos', rol.permisos.map((p: Permiso) => p.id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar rol',
        variant: 'destructive',
      });
      navigate('/seguridad/roles');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: RolFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/roles/${id}`, data);
        toast({
          title: 'Éxito',
          description: 'Rol actualizado correctamente',
        });
      } else {
        await api.post('/roles', data);
        toast({
          title: 'Éxito',
          description: 'Rol creado correctamente',
        });
      }
      navigate('/seguridad/roles');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar rol',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermiso = (permisoId: string) => {
    const current = selectedPermisos || [];
    if (current.includes(permisoId)) {
      setValue('permisos', current.filter((p) => p !== permisoId));
    } else {
      setValue('permisos', [...current, permisoId]);
    }
  };

  const toggleModulo = (modulo: string) => {
    const permisosModulo = permisosGrouped[modulo] || [];
    const permisosIds = permisosModulo.map((p) => p.id);
    const current = selectedPermisos || [];
    
    const allSelected = permisosIds.every((id) => current.includes(id));
    
    if (allSelected) {
      setValue('permisos', current.filter((p) => !permisosIds.includes(p)));
    } else {
      const newPermisos = [...new Set([...current, ...permisosIds])];
      setValue('permisos', newPermisos);
    }
  };

  const isModuloSelected = (modulo: string) => {
    const permisosModulo = permisosGrouped[modulo] || [];
    const permisosIds = permisosModulo.map((p) => p.id);
    const current = selectedPermisos || [];
    return permisosIds.every((id) => current.includes(id));
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/seguridad/roles')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos del rol' : 'Complete los datos del nuevo rol'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Información del Rol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input id="codigo" {...register('codigo')} placeholder="Ej: SUPERVISOR" />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Ej: Supervisor" />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" {...register('descripcion')} placeholder="Descripción del rol" />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Permisos seleccionados: <strong>{selectedPermisos?.length || 0}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Permisos</CardTitle>
              <CardDescription>Seleccione los permisos que tendrá este rol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permisosGrouped).map(([modulo, permisos]) => (
                  <div key={modulo} className="space-y-2">
                    <div
                      className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleModulo(modulo)}
                    >
                      <div
                        className={`w-5 h-5 border rounded flex items-center justify-center ${
                          isModuloSelected(modulo)
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-input'
                        }`}
                      >
                        {isModuloSelected(modulo) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="font-medium capitalize">{modulo}</span>
                      <span className="text-sm text-muted-foreground">
                        ({permisos.length} permisos)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-7">
                      {permisos.map((permiso) => (
                        <div
                          key={permiso.id}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                            selectedPermisos?.includes(permiso.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => togglePermiso(permiso.id)}
                        >
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              selectedPermisos?.includes(permiso.id)
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-input'
                            }`}
                          >
                            {selectedPermisos?.includes(permiso.id) && (
                              <Check className="h-2.5 w-2.5" />
                            )}
                          </div>
                          <span className="text-sm capitalize">{permiso.accion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/seguridad/roles')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Rol
          </Button>
        </div>
      </form>
    </div>
  );
}
