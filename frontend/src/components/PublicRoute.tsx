import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    // If the user is already authenticated, redirect them to the dashboard immediately
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
