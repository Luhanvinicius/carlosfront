import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard">Dashboard</Link>

      {usuario?.role === 'ADMIN' && (
        <>
          <Link to="/usuarios">Usuários</Link>
          <Link to="/admin/config">Configurações</Link>
          <Link to="/perfil">Meu Perfil</Link>
          <Link to="/atletasList">Atletas</Link>
        </>
      )}

      {usuario?.role === 'USER' && (
        <Link to="/perfil">Meu Perfil</Link>
      )}

      <button onClick={logout} style={styles.sair}>Sair</button>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    gap: '20px',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    alignItems: 'center',
  },
  sair: {
    marginLeft: 'auto',
    padding: '6px 12px',
    cursor: 'pointer',
  },
};

export default Menu;
