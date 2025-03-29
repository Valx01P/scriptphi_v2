// client/src/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from '../store/store';

const ProtectedRoute = () => {
  const { isAuthenticated, initAuth } = useStore();
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;