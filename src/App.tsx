import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/useAuth';
import { initializeBranding } from './lib/branding';
import Layout from './components/Layout';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Conversations from './pages/conversations';
import Promotions from './pages/promotions';
import Knowledge from './pages/knowledge';
import Calendar from './pages/calendar';
import TestSystem from './pages/test-system';
import Settings from './pages/settings';
import OAuthSuccess from './pages/oauth-success';

// Componente para proteger rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Inicializar branding
    initializeBranding().catch(console.error);
    
    // Verificar autenticación al cargar la app
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="test-system" element={<TestSystem />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Ruta pública para OAuth callback */}
      <Route path="/oauth/success" element={<OAuthSuccess />} />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
