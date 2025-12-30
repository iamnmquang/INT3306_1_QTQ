import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return children;
}
