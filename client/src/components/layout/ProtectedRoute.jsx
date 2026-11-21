import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner label="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If admin is in /lead, redirect to /admin
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // If lead is in /admin, redirect to /lead
    if (user?.role === 'lead') {
      return <Navigate to="/lead" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
