import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  id: number;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

type AuthContextType = {
  usuario: JwtPayload | null;
  autenticado: boolean;
  logout: () => void;
  setUsuario: (usuario: JwtPayload | null) => void; // ✅ adicionar isso
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  autenticado: false,
  logout: () => {},
  setUsuario: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUsuario(decoded);
      } catch {
        localStorage.removeItem('token');
        setUsuario(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: !!usuario,
        logout,
        setUsuario, // ✅ incluir aqui
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
