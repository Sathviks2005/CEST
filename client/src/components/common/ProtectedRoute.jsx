import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <FaSpinner className="text-4xl text-brand-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Verifying secure authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to proper role dashboard
    const fallbackPath =
      role === 'admin'
        ? '/admin'
        : role === 'clinician'
        ? '/dashboard/clinician'
        : '/dashboard/self';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};
