import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

type Props = {
  children: React.ReactNode;
  requiredRole?: string; // 'admin' | 'user' | etc
};

type JwtPayload = {
  id: number;
  nome: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const PrivateRoute = ({ children, requiredRole }: Props) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (requiredRole && payload.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    return <>{children}</>;
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
