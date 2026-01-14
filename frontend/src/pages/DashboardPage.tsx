import {
  AlertTriangle,
  Package,
  Users,
  Truck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

const stats = [
  {
    title: 'Emergencias Activas',
    value: '3',
    description: 'Eventos en curso',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Productos en Stock',
    value: '1,247',
    description: 'Unidades disponibles',
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Familias Beneficiarias',
    value: '856',
    description: 'Registradas en el sistema',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Entregas del Mes',
    value: '124',
    description: 'Kits entregados',
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
  },
];

const alerts = [
  {
    type: 'warning',
    message: 'Stock bajo en Agua Potable (50 unidades)',
    time: 'Hace 2 horas',
  },
  {
    type: 'info',
    message: 'Nueva zona afectada registrada en Antioquia',
    time: 'Hace 4 horas',
  },
  {
    type: 'warning',
    message: 'Stock bajo en Kits de Higiene (30 unidades)',
    time: 'Hace 6 horas',
  },
];

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.nombres}. Resumen del sistema de ayudas humanitarias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Alertas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="bg-green-100 text-green-500 p-2 rounded-lg">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Kit entregado</p>
                  <p className="text-xs text-muted-foreground">
                    Familia Rodriguez - Zona Norte
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Hace 1h</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="bg-blue-100 text-blue-500 p-2 rounded-lg">
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ingreso de inventario</p>
                  <p className="text-xs text-muted-foreground">
                    200 unidades de agua potable
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Hace 3h</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="bg-purple-100 text-purple-500 p-2 rounded-lg">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nueva familia registrada</p>
                  <p className="text-xs text-muted-foreground">
                    Familia Martinez - 5 miembros
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Hace 5h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
