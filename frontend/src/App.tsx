import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DreamListPage } from '@/pages/DreamListPage';
import { DreamDetailPage } from '@/pages/DreamDetailPage';
import { CreateDreamPage } from '@/pages/CreateDreamPage';
import { TagsPage } from '@/pages/TagsPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-soft-light/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dream-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const { token, fetchCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (token && !isAuthenticated) {
      fetchCurrentUser();
    }
  }, [token, isAuthenticated, fetchCurrentUser]);

  useEffect(() => {
    const handleAuthLogout = () => {
      useAuthStore.getState().logout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <AuthLayout>
            <LandingPage />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        </PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/dreams" element={
        <ProtectedRoute>
          <MainLayout>
            <DreamListPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/dreams/create" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateDreamPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/dreams/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <DreamDetailPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/tags" element={
        <ProtectedRoute>
          <MainLayout>
            <TagsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/analysis" element={
        <ProtectedRoute>
          <MainLayout>
            <AnalysisPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/404" element={
        <AuthLayout>
          <NotFoundPage />
        </AuthLayout>
      } />

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
