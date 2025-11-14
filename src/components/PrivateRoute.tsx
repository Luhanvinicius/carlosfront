// src/routes/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react"; // ✅ tipo-only

type Role = "ADMIN" | "USER" | string;

type Props = {
  children: ReactNode;                 // ✅ usando o tipo importado
  roles?: Role[];
  role?: Role;                         // compat
  requiredRole?: Role;                 // compat
  loginRedirectTo?: string;
  unauthorizedRedirectTo?: string;
};

export default function PrivateRoute({
  children,
  roles,
  role,
  requiredRole,
  loginRedirectTo = "/login",
  unauthorizedRedirectTo = "/unauthorized",
}: Props) {
  const auth = useAuth() as any;
  const { usuario } = auth;

  const authReady: boolean | undefined =
    typeof auth?.authReady === "boolean" ? auth.authReady : undefined;
  if (authReady === false) return null;

  if (!usuario) return <Navigate to={loginRedirectTo} replace />;

  const required = (roles && roles.length ? roles : [role, requiredRole].filter(Boolean)) as Role[];
  if (required?.length) {
    const allowed = required.includes(usuario.role as Role);
    if (!allowed) return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  return <>{children}</>;
}
