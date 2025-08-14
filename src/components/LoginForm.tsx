import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

type JwtPayload = {
  id: number;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { setUsuario } = useAuth();

  function getRedirectRoute(role: string): string {
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'USER') return '/perfil';
  return '/unauthorized';
}

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {

      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode<JwtPayload>(token);
      setUsuario(decoded); // <- atualizar o contexto imediatamente

      console.log('Usuário logado:', decoded.name);

      navigate(getRedirectRoute(decoded.role));
      //navigate('/dashboard');
    } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.data?.mensagem) {
        setErro(err.response.data.mensagem);
      } else {
        setErro('Erro inesperado no servidor.');
      }
    } else {
      setErro('Erro desconhecido.');
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
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        {erro && <p style={styles.erro}>{erro}</p>}
      </form>
      <p className="mt-4 text-center">
        Não tem conta?{' '}
        <a href="/criar-conta" className="text-blue-600 hover:underline">
           Criar conta
        </a>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    textAlign: 'center' as const,
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  erro: {
    color: 'red',
    marginTop: '10px',
  },
};

export default LoginForm;
