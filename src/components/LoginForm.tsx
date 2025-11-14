import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { isAxiosError } from "axios";
import { api, setBasicCreds } from "@/lib/api";

type JwtPayload = {
  id: number | string;
  name?: string;
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
};

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "BASIC").toUpperCase();

function getRedirectRoute(role: string): string {
  if (role === "ADMIN") return "/dashboard";
  if (role === "USER") return "/perfil";
  return "/unauthorized";
}

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { setUsuario } = useAuth();

useEffect(() => {
  const MODE = (import.meta.env.VITE_AUTH_MODE || "JWT").toUpperCase();
  if (MODE === "BASIC") {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      const u = JSON.parse(raw);
      navigate(getRedirectRoute(u.role), { replace: true });
    }
  } else {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard", { replace: true });
  }
}, [navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      if (AUTH_MODE === "BASIC") {
        // Backend retorna apenas { user } no modo BASIC (sem token)
        const user = data.user || data.usuario;
        
        if (!user) {
          setErro("Resposta do servidor inválida");
          return;
        }

        const usuarioFinal = {
          id: user.id,
          name: user.name || user.nome,
          email: user.email,
          role: user.role,
          atletaId: user.atletaId || null,
        } as JwtPayload;

        // Seta usuario e credenciais
        setUsuario(usuarioFinal);
        localStorage.setItem("usuario", JSON.stringify(usuarioFinal));
        localStorage.setItem("token", "basic-mode"); // Placeholder para compatibilidade
        setBasicCreds({ email: email.trim().toLowerCase(), senha: password });

        navigate(getRedirectRoute(usuarioFinal.role), { replace: true });
        return;
      }

      // JWT: backend retorna { token, user }
      const { token } = data;
      if (!token) {
        setErro("Token não recebido do servidor");
        return;
      }

      localStorage.setItem("token", token);
      const decoded = jwtDecode<JwtPayload>(token);
      setUsuario(decoded);
      navigate(getRedirectRoute(decoded.role));
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        if (err.response?.data?.mensagem) setErro(err.response.data.mensagem);
        else setErro("Erro inesperado no servidor.");
      } else {
        setErro("Erro desconhecido.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={carregando} style={styles.button}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        {erro && <p style={styles.erro}>{erro}</p>}
      </form>
      <p className="mt-4 text-center">
        Não tem conta?{" "}
        <a href="/criar-conta" className="text-blue-600 hover:underline">
          Criar conta
        </a>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center" as const,
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  erro: {
    color: "red",
    marginTop: "10px",
  },
};

export default LoginForm;
