import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import Menu from './components/Menu';
import { useAuth } from './context/AuthContext';
import Perfil from './pages/Perfil';
import Usuarios from './pages/Usuarios';
import AtletasList from './pages/AtletasList';
import PreencherPerfilAtleta from '@/pages/PreencherPerfilAtleta';
import CriarConta from './pages/CriarConta';


function App() {
  const { autenticado } = useAuth();


 return (
    
    <BrowserRouter>
      {autenticado && <Menu />}
      <Routes>
        <Route path="/criar-conta" element={<CriarConta />} />        
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={
          <PrivateRoute requiredRole="USER">
            <Dashboard />
          </PrivateRoute>          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/perfil"   
          element={ 
            <PrivateRoute> 
                <Perfil />  
            </PrivateRoute>
          }
      />
      <Route
        path="/usuarios"
        element={
          <PrivateRoute role="ADMIN">
            <Usuarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/atletasList"
        element={
          <PrivateRoute role="ADMIN">
            <AtletasList />
          </PrivateRoute>
          }
        />
      <Route path="/preencherAtleta" element={<PreencherPerfilAtleta />} />        
      </Routes>
    </BrowserRouter>
  );
 }

export default App;


/* export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoginForm />
    </div>
  );
} */

