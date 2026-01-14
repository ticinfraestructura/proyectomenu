# Sistema de Gestión de Ayudas Humanitarias

Sistema para la gestión de inventarios de ayudas humanitarias entregadas en el marco de emergencias por riesgos naturales.

## 🚀 Tecnologías

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt (autenticación)
- Jest + Supertest (testing)

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Query
- Zustand
- React Router
- Vitest (testing)

### Infraestructura
- Docker + Docker Compose
- Nginx (producción)

## 📋 Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd proyectomenu
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Desarrollo con Docker (Recomendado)
```bash
# Levantar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 4. Desarrollo Local (Sin Docker)

#### Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Commands

### Desarrollo
```bash
# Iniciar
docker-compose -f docker-compose.dev.yml up -d

# Detener
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Testing
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Producción
```bash
docker-compose up -d --build
```

## 🧪 Testing

### Backend
```bash
cd backend
npm run test           # Todos los tests
npm run test:unit      # Tests unitarios
npm run test:integration  # Tests de integración
npm run test:coverage  # Con cobertura
```

### Frontend
```bash
cd frontend
npm run test           # Todos los tests
npm run test:coverage  # Con cobertura
```

## 📁 Estructura del Proyecto

```
proyectomenu/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   └── seed.ts          # Datos iniciales
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── middleware/      # Middlewares (auth, error)
│   │   ├── routes/          # Rutas API
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades
│   ├── tests/
│   │   ├── unit/           # Tests unitarios
│   │   └── integration/    # Tests de integración
│   ├── Dockerfile
│   └── Dockerfile.dev
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades
│   │   ├── pages/          # Páginas
│   │   └── stores/         # Estado (Zustand)
│   ├── Dockerfile
│   └── Dockerfile.dev
├── docker-compose.yml      # Producción
├── docker-compose.dev.yml  # Desarrollo
├── docker-compose.test.yml # Testing
└── .env.example
```

## 🔐 Autenticación y Autorización (RBAC)

### Roles Predefinidos

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso total al sistema |
| COORDINADOR | Emergencias, entregas y reportes |
| BODEGUERO | Inventario y movimientos |
| DIGITADOR | Beneficiarios y entregas |
| CONSULTA | Solo lectura |

### Usuario Administrador por Defecto
```
Email: admin@sistema.com
Password: Admin123!
```

## 📊 Módulos del Sistema

1. **Emergencias**: Eventos, zonas afectadas, tipos de desastre
2. **Inventario**: Productos, bodegas, movimientos
3. **Beneficiarios**: Personas, familias, condiciones especiales
4. **Entregas**: Kits de ayuda, entregas, actas
5. **Configuración**: Categorías, unidades de medida
6. **Seguridad**: Usuarios, roles, permisos, auditoría

## 🌐 Endpoints API

### Autenticación
```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registrar usuario (solo ADMIN)
POST /api/auth/refresh-token  # Refrescar token
POST /api/auth/logout         # Cerrar sesión
POST /api/auth/change-password # Cambiar contraseña
GET  /api/auth/profile        # Obtener perfil
```

### Health Check
```
GET /api/health               # Estado del servidor
```

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DATABASE_URL | URL de conexión PostgreSQL | postgresql://user:pass@localhost:5432/db |
| JWT_SECRET | Secreto para JWT | your_secret_key |
| JWT_EXPIRES_IN | Expiración del token | 1d |
| JWT_REFRESH_EXPIRES_IN | Expiración refresh token | 7d |
| BACKEND_PORT | Puerto del backend | 3000 |
| VITE_API_URL | URL del API para frontend | http://localhost:3000/api |

## 📈 Próximas Fases

- **Fase 2**: Módulo Seguridad completo + CRUDs
- **Fase 3**: Módulos Configuración y Emergencias
- **Fase 4**: Módulos Inventario y Beneficiarios
- **Fase 5**: Módulo Entregas + Dashboard avanzado
- **Fase 6**: CI/CD pipelines + Documentación completa

## 📝 Licencia

Este proyecto es privado y de uso exclusivo para gestión de ayudas humanitarias.

---

**Desarrollado para la gestión de emergencias por riesgos naturales** 🌍
