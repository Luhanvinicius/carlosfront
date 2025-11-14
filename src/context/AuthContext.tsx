// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "JWT").toUpperCase() as "JWT" | "BASIC";

type JwtPayload = {
  id: number | string;
  name?: string;
  nome?: string;
  email?: string;
  role?: string;
  atletaId?: string | null;
  iat?: number;
  exp?: number;
};

type AuthContextType = {
  usuario: JwtPayload | null;
  autenticado: boolean;
  token: string | null;
  // só memória, usado no BASIC para mandar Authorization: Basic
  basicCreds: { email: string; senha: string } | null;

  // mantém compat com seu código atual
  setUsuario: (usuario: JwtPayload | null) => void;
  logout: () => void;

  // opcional: facilita fazer login centralizado
  login: (args: {
    token: string;
    usuario?: JwtPayload | null;
    basicCreds?: { email: string; senha: string } | null;
  }) => void;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  autenticado: false,
  token: null,
  basicCreds: null,
  logout: () => {},
  setUsuario: () => {},
  login: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<JwtPayload | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [basicCreds, setBasicCreds] = useState<{ email: string; senha: string } | null>(null);

  // hidratação inicial
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setUsuario(null);
      return;
    }

    if (AUTH_MODE === "JWT") {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        setUsuario(decoded);
      } catch {
        // token inválido/expirado
        localStorage.removeItem("token");
        setUsuario(null);
      }
    } else {
      // BASIC: não há o que decodificar.
      // use o usuario salvo pelo login no localStorage (feito no login page)
      const raw = localStorage.getItem("usuario");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setUsuario(u);
        } catch {
          setUsuario(null);
        }
      } else {
        // sem usuario salvo -> sessão não recuperável pós refresh
        setUsuario(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario"); // no BASIC, você salva isso no login
    setToken(null);
    setUsuario(null);
    setBasicCreds(null);
  };

  const login: AuthContextType["login"] = ({ token, usuario, basicCreds }) => {
    setToken(token);
    localStorage.setItem("token", token);

    if (AUTH_MODE === "BASIC") {
      // No BASIC, o backend retorna { token: "basic-mode", usuario }
      if (usuario) {
        setUsuario(usuario);
        localStorage.setItem("usuario", JSON.stringify(usuario));
      }
      // credenciais apenas em memória (não persistir)
      setBasicCreds(basicCreds ?? null);
    } else {
      // JWT: preferimos decodificar o token, mas se backend já mandar usuario também é ok
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUsuario(decoded);
      } catch {
        setUsuario(usuario ?? null);
      }
      // não guardamos basicCreds no modo JWT
      setBasicCreds(null);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      usuario,
      autenticado: !!usuario,
      token,
      basicCreds,
      setUsuario,
      logout,
      login,
    }),
    [usuario, token, basicCreds]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
