import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsuariosPage, UsuarioFormPage, UsuarioPasswordPage, RolesPage, RolFormPage } from './pages/seguridad';

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
        
        {/* Otros módulos - Pendientes */}
        <Route path="emergencias/*" element={<div className="p-6">Módulo Emergencias (Fase 3)</div>} />
        <Route path="inventario/*" element={<div className="p-6">Módulo Inventario (Fase 4)</div>} />
        <Route path="beneficiarios/*" element={<div className="p-6">Módulo Beneficiarios (Fase 4)</div>} />
        <Route path="entregas/*" element={<div className="p-6">Módulo Entregas (Fase 5)</div>} />
        <Route path="configuracion/*" element={<div className="p-6">Módulo Configuración (Fase 3)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
