import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsuariosPage, UsuarioFormPage, UsuarioPasswordPage, RolesPage, RolFormPage } from './pages/seguridad';
import { CategoriasPage, CategoriaFormPage, UnidadesPage, UnidadFormPage } from './pages/configuracion';
import { TiposDesastrePage, TipoDesastreFormPage, EventosPage, EventoFormPage, EventoDetallePage, ZonasPage, ZonaFormPage } from './pages/emergencias';
import { ProductosPage, ProductoFormPage, ProductoDetallePage, BodegasPage, BodegaFormPage, MovimientosPage } from './pages/inventario';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* Módulo Seguridad */}
        <Route path="seguridad/usuarios" element={<UsuariosPage />} />
        <Route path="seguridad/usuarios/nuevo" element={<UsuarioFormPage />} />
        <Route path="seguridad/usuarios/:id" element={<UsuarioFormPage />} />
        <Route path="seguridad/usuarios/:id/password" element={<UsuarioPasswordPage />} />
        <Route path="seguridad/roles" element={<RolesPage />} />
        <Route path="seguridad/roles/nuevo" element={<RolFormPage />} />
        <Route path="seguridad/roles/:id" element={<RolFormPage />} />
        <Route path="seguridad/permisos" element={<div className="p-6">Módulo Permisos (Próximamente)</div>} />
        
        {/* Módulo Configuración */}
        <Route path="configuracion/categorias" element={<CategoriasPage />} />
        <Route path="configuracion/categorias/nuevo" element={<CategoriaFormPage />} />
        <Route path="configuracion/categorias/:id" element={<CategoriaFormPage />} />
        <Route path="configuracion/unidades" element={<UnidadesPage />} />
        <Route path="configuracion/unidades/nuevo" element={<UnidadFormPage />} />
        <Route path="configuracion/unidades/:id" element={<UnidadFormPage />} />
        
        {/* Módulo Emergencias */}
        <Route path="emergencias/tipos" element={<TiposDesastrePage />} />
        <Route path="emergencias/tipos/nuevo" element={<TipoDesastreFormPage />} />
        <Route path="emergencias/tipos/:id" element={<TipoDesastreFormPage />} />
        <Route path="emergencias/eventos" element={<EventosPage />} />
        <Route path="emergencias/eventos/nuevo" element={<EventoFormPage />} />
        <Route path="emergencias/eventos/:id" element={<EventoDetallePage />} />
        <Route path="emergencias/eventos/:id/editar" element={<EventoFormPage />} />
        <Route path="emergencias/zonas" element={<ZonasPage />} />
        <Route path="emergencias/zonas/nuevo" element={<ZonaFormPage />} />
        <Route path="emergencias/zonas/:id" element={<ZonaFormPage />} />
        <Route path="emergencias/zonas/:id/editar" element={<ZonaFormPage />} />
        
        {/* Módulo Inventario */}
        <Route path="inventario/productos" element={<ProductosPage />} />
        <Route path="inventario/productos/nuevo" element={<ProductoFormPage />} />
        <Route path="inventario/productos/:id" element={<ProductoDetallePage />} />
        <Route path="inventario/productos/:id/editar" element={<ProductoFormPage />} />
        <Route path="inventario/bodegas" element={<BodegasPage />} />
        <Route path="inventario/bodegas/nuevo" element={<BodegaFormPage />} />
        <Route path="inventario/bodegas/:id" element={<BodegaFormPage />} />
        <Route path="inventario/bodegas/:id/editar" element={<BodegaFormPage />} />
        <Route path="inventario/movimientos" element={<MovimientosPage />} />
        
        {/* Otros módulos - Pendientes */}
        <Route path="beneficiarios/*" element={<div className="p-6">Módulo Beneficiarios (Fase 4)</div>} />
        <Route path="entregas/*" element={<div className="p-6">Módulo Entregas (Fase 5)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
