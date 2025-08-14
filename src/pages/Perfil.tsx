import { useEffect, useState } from 'react';
import axios from 'axios';
import EditarUsuarioModal from '@/components/EditarUsuarioModal';
import AtualizarFotoModal from '@/components/AtualizarFotoModal';
import EditarAtletaModal from '@/components/EditarAtletaModal'; // Importa o modal novo
import AtletaModal from '@/components/AtletaModal'; // Importa o modal novo

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  categoria?: string;
  idade?: number;
  fotoUrl?: string;
  fone?: string;
  usuarioId: string;
}

const Perfil = () => {
  const [token, setToken] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [atleta, setAtleta] = useState<Atleta | null>(null);

  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [modalEditarAtleta, setModalEditarAtleta] = useState(false);
  const [modalEditarFoto, setModalEditarFoto] = useState(false);
  const [modalAtletaModal, setModalAtleta] = useState(false);



  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUsuario();
      fetchAtleta();
    }
  }, [token]);

  const fetchUsuario = async () => {
    try {
      const res = await axios.get('http://localhost:3000/user/getUsuarioLogado', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuario(res.data);
    } catch (error) {
      console.error('Erro ao buscar usuário', error);
    }
  };

  const fetchAtleta = async () => {
    try {
      const res = await axios.get('http://localhost:3000/atleta/me/atleta', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtleta(res.data);
    } catch (error: any) {
      if (error.response?.status === 204) {
        setAtleta(null);
      } else {
        console.error('Erro ao buscar atleta', error);
      }
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      {/* Seção de usuário */}
      {usuario && (
        <div className="bg-white shadow-md rounded-2xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Dados de Usuário</h2>
          <p><strong>Nome:</strong> {usuario.name}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Tipo:</strong> {usuario.role}</p>
          <button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setModalEditarUsuario(true)}
          >
            Editar Dados do Usuário
          </button>
        </div>
      )}

      {/* Seção de atleta */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">Dados de Atleta</h2>

        {atleta ? (
          <>
            {atleta.fotoUrl && (
              <div className="flex justify-center mb-4">
                <img
                  src={atleta.fotoUrl}
                  alt="Foto do atleta"
                  className="w-32 h-32 object-cover rounded-full shadow-md"
                />
              </div>
            )}
            <p><strong>Nome:</strong> {atleta.nome}</p>
            <p><strong>Idade:</strong> {atleta.idade}</p>
            <p><strong>Gênero:</strong> {atleta.genero}</p>
            <p><strong>Categoria:</strong> {atleta.categoria}</p>
            <p><strong>Telefone:</strong> {atleta.fone}</p>

            <div className="flex justify-center gap-3 mb-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => setModalEditarAtleta(true)}
              >
                Editar Dados do Atleta
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={() => setModalEditarFoto(true)}
              >
                Alterar Foto
              </button>
            </div>
          </>
        ) : (
          <div>
            <p>Você ainda não cadastrou seu perfil de atleta.</p>
            <button
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setModalAtleta(true)}
            >
              Criar Perfil de Atleta
            </button>
          </div>
        )}
      </div>

      {/* Modais */}
      <EditarUsuarioModal
        isOpen={modalEditarUsuario}
        onClose={() => setModalEditarUsuario(false)}
        onAtualizado={fetchUsuario}
        token={token}
        usuario={usuario}
      />

      <EditarAtletaModal
        atleta={atleta}
        isOpen={modalEditarAtleta}
        onClose={() => setModalEditarAtleta(false)}
        onAtualizado={fetchAtleta}
        token={token}
      />

      <AtletaModal
        atleta={atleta}
        mode='criar'
        isOpen={modalAtletaModal}
        onClose={() => setModalAtleta(false)}
        onSuccess={fetchAtleta}
        token={token}
      />      

      <AtualizarFotoModal
        isOpen={modalEditarFoto}
        onClose={() => setModalEditarFoto(false)}
        onAtualizado={fetchAtleta}
        token={token}
        atleta={atleta}
      />
    </div>
  );
};

export default Perfil;
