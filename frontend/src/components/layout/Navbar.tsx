import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Package,
  Users,
  Truck,
  Settings,
  Shield,
  LogOut,
  User,
  ChevronDown,
  Home,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  {
    label: 'Emergencias',
    icon: AlertTriangle,
    path: '/emergencias',
    permission: 'emergencias:leer',
    submenu: [
      { label: 'Eventos', path: '/emergencias/eventos' },
      { label: 'Zonas Afectadas', path: '/emergencias/zonas' },
      { label: 'Tipos de Desastre', path: '/emergencias/tipos' },
    ],
  },
  {
    label: 'Inventario',
    icon: Package,
    path: '/inventario',
    permission: 'inventario:leer',
    submenu: [
      { label: 'Productos', path: '/inventario/productos' },
      { label: 'Bodegas', path: '/inventario/bodegas' },
      { label: 'Movimientos', path: '/inventario/movimientos' },
    ],
  },
  {
    label: 'Beneficiarios',
    icon: Users,
    path: '/beneficiarios',
    permission: 'beneficiarios:leer',
    submenu: [
      { label: 'Personas', path: '/beneficiarios/personas' },
      { label: 'Familias', path: '/beneficiarios/familias' },
      { label: 'Condiciones Especiales', path: '/beneficiarios/condiciones' },
    ],
  },
  {
    label: 'Entregas',
    icon: Truck,
    path: '/entregas',
    permission: 'entregas:leer',
    submenu: [
      { label: 'Kits de Ayuda', path: '/entregas/kits' },
      { label: 'Registro de Entregas', path: '/entregas/registro' },
      { label: 'Actas de Entrega', path: '/entregas/actas' },
    ],
  },
  {
    label: 'Configuración',
    icon: Settings,
    path: '/configuracion',
    permission: 'configuracion:leer',
    submenu: [
      { label: 'Categorías de Producto', path: '/configuracion/categorias' },
      { label: 'Unidades de Medida', path: '/configuracion/unidades' },
    ],
  },
  {
    label: 'Seguridad',
    icon: Shield,
    path: '/seguridad',
    permission: 'seguridad:leer',
    roles: ['ADMIN'],
    submenu: [
      { label: 'Usuarios', path: '/seguridad/usuarios' },
      { label: 'Roles', path: '/seguridad/roles' },
      { label: 'Permisos', path: '/seguridad/permisos' },
      { label: 'Auditoría', path: '/seguridad/auditoria' },
    ],
  },
];

export function Navbar() {
  const { user, logout, hasPermission, hasRole } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const canAccessMenu = (item: typeof menuItems[0]) => {
    if (item.roles && !item.roles.some((role) => hasRole(role))) {
      return false;
    }
    if (item.permission) {
      const [modulo, accion] = item.permission.split(':');
      return hasPermission(modulo, accion);
    }
    return true;
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <AlertTriangle className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden md:block">
                Ayudas Humanitarias
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Inicio
                </Button>
              </Link>

              {menuItems.filter(canAccessMenu).map((item) => (
                <DropdownMenu key={item.path}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.submenu.map((subitem) => (
                      <DropdownMenuItem key={subitem.path} asChild>
                        <Link to={subitem.path}>{subitem.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:block">
                    {user?.nombres} {user?.apellidos}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.nombres} {user?.apellidos}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground mt-1">
                      Roles: {user?.roles.join(', ')}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
