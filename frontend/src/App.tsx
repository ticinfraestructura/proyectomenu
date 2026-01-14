import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

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
        <Route path="emergencias/*" element={<div>Módulo Emergencias (Fase 2)</div>} />
        <Route path="inventario/*" element={<div>Módulo Inventario (Fase 2)</div>} />
        <Route path="beneficiarios/*" element={<div>Módulo Beneficiarios (Fase 2)</div>} />
        <Route path="entregas/*" element={<div>Módulo Entregas (Fase 2)</div>} />
        <Route path="configuracion/*" element={<div>Módulo Configuración (Fase 2)</div>} />
        <Route path="seguridad/*" element={<div>Módulo Seguridad (Fase 2)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
