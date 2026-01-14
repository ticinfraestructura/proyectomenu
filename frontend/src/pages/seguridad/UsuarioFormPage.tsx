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

interface Rol {
  id: string;
  codigo: string;
  nombre: string;
}

const usuarioSchema = z.object({
  nombres: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  celular: z.string().min(7, 'Mínimo 7 caracteres').max(20),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Debe contener mayúscula, minúscula y número'
  ).optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, 'Seleccione al menos un rol'),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      email: '',
      celular: '',
      password: '',
      roles: [],
    },
  });

  const selectedRoles = watch('roles');

  useEffect(() => {
    fetchRoles();
    if (isEditing) {
      fetchUsuario();
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar roles',
        variant: 'destructive',
      });
    }
  };

  const fetchUsuario = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/usuarios/${id}`);
      const usuario = response.data.data;
      setValue('nombres', usuario.nombres);
      setValue('apellidos', usuario.apellidos);
      setValue('email', usuario.email);
      setValue('celular', usuario.celular);
      setValue('roles', usuario.roles.map((r: Rol) => r.id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cargar usuario',
        variant: 'destructive',
      });
      navigate('/seguridad/usuarios');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UsuarioFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        const { password, ...updateData } = data;
        await api.put(`/usuarios/${id}`, updateData);
        toast({
          title: 'Éxito',
          description: 'Usuario actualizado correctamente',
        });
      } else {
        await api.post('/usuarios', data);
        toast({
          title: 'Éxito',
          description: 'Usuario creado correctamente',
        });
      }
      navigate('/seguridad/usuarios');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (rolId: string) => {
    const current = selectedRoles || [];
    if (current.includes(rolId)) {
      setValue('roles', current.filter((r) => r !== rolId));
    } else {
      setValue('roles', [...current, rolId]);
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/seguridad/usuarios')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique los datos del usuario' : 'Complete los datos del nuevo usuario'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input id="nombres" {...register('nombres')} />
                {errors.nombres && (
                  <p className="text-sm text-red-500">{errors.nombres.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input id="apellidos" {...register('apellidos')} />
                {errors.apellidos && (
                  <p className="text-sm text-red-500">{errors.apellidos.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input id="celular" {...register('celular')} />
                {errors.celular && (
                  <p className="text-sm text-red-500">{errors.celular.message}</p>
                )}
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres, con mayúscula, minúscula y número
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((rol) => (
                  <div
                    key={rol.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoles?.includes(rol.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleRole(rol.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles?.includes(rol.id) || false}
                      onChange={() => toggleRole(rol.id)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">{rol.nombre}</p>
                      <p className="text-sm text-muted-foreground">{rol.codigo}</p>
                    </div>
                  </div>
                ))}
                {errors.roles && (
                  <p className="text-sm text-red-500">{errors.roles.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/seguridad/usuarios')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Crear'} Usuario
          </Button>
        </div>
      </form>
    </div>
  );
}
