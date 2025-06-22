import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import TrackingPage from '../pages/TrackingPage';
import ShippingRequestPage from '../pages/ShippingRequestPage';
import WalletPage from '../pages/WalletPage';
import ReturnsPage from '../pages/ReturnsPage';
import SecureLogin from '../components/auth/SecureLogin';
import RegisterForm from '../components/auth/RegisterForm';
import AdminDashboard from '../pages/AdminDashboard';
import UserDashboard from '../pages/UserDashboard';
import AdminShipmentRequests from '../pages/AdminShipmentRequests';
import AdminReturnRequests from '../pages/AdminReturnRequests';
import AdminClaims from '../pages/AdminClaims';
import AdminInternalAlerts from '../pages/AdminInternalAlerts';
import AdminPreRegistrations from '../pages/AdminPreRegistrations';
import ClientShipmentHistory from '../pages/ClientShipmentHistory';
import AdminShipmentHistory from '../pages/AdminShipmentHistory';
import AdminRegisterShipping from '../pages/AdminRegisterShipping';
import AdminTracking from '../pages/AdminTracking';
import AdminPackageHistory from '../pages/AdminPackageHistory';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

// Componente para rutas protegidas por rol
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Si el usuario no tiene los roles permitidos, redirige a la página de inicio o a una página de acceso denegado
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Ruta de inicio - redirige al dashboard si está autenticado */}
      <Route path="/" element={
        isAuthenticated ? (
          user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF ? (
            <Navigate to="/admin" />
          ) : (
            <Navigate to="/dashboard" />
          )
        ) : (
          <HomePage />
        )
      } />
      
      {/* Rutas públicas */}
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/login" element={<SecureLogin />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Rutas protegidas para clientes */}
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF]}>
            <UserDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/shipping-request"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF]}>
            <ShippingRequestPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF]}>
            <WalletPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF]}>
            <ReturnsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/my-shipments"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF]}>
            <ClientShipmentHistory />
          </RoleProtectedRoute>
        }
      />

      {/* Rutas protegidas para administradores */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/shipment-requests"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminShipmentRequests />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/return-requests"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminReturnRequests />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/claims"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminClaims />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/internal-alerts"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminInternalAlerts />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/preregistrations"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminPreRegistrations />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/shipment-history"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminShipmentHistory />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/register-shipping"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminRegisterShipping />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/tracking"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminTracking />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/package-history"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <AdminPackageHistory />
          </RoleProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes; 