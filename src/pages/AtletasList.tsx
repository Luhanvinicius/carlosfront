import { useEffect, useState } from 'react';
import axios from 'axios';
import EditarAtletaModal from '@/components/EditarAtletaModal';
import AtualizarFotoModal from '@/components/AtualizarFotoModal'; // novo import

interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  categoria?: string;
  idade?: number;
  fotoUrl?: string;
  usuarioId: string;
}

const AtletasList = () => {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [token, setToken] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [role, setRole] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [atletaSelecionado, setAtletaSelecionado] = useState<Atleta | null>(null);
  const [modalFotoAberto, setModalFotoAberto] = useState(false); // novo estado

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) fetchAtletas();
  }, [token]);

  const fetchAtletas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/atleta/listarAtletas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAtletas(res.data.atletas || res.data);
      setUsuarioId(res.data.usuario?.id || '');
      setRole(res.data.usuario?.role || '');
    } catch (error) {
      console.error('Erro ao buscar atletas', error);
    }
  };

  const abrirModalEdicao = (atleta: Atleta) => {
    setAtletaSelecionado(atleta);
    setModalAberto(true);
  };

  const abrirModalFoto = (atleta: Atleta) => {
    setAtletaSelecionado(atleta);
    setModalFotoAberto(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Atletas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {atletas.map((atleta) => (
          <div
            key={atleta.id}
            className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center"
          >
            {atleta.fotoUrl && (
              <img
                src={atleta.fotoUrl}
                alt={atleta.nome}
                className="w-32 h-32 object-cover rounded-full mb-2"
              />
            )}
            <h2 className="text-lg font-semibold">{atleta.nome}</h2>
            <p>Idade: {atleta.idade}</p>
            <p>Categoria: {atleta.categoria}</p>
            <p>Gênero: {atleta.genero}</p>

            <div className="mt-3 flex flex-col gap-2 w-full">
              <button
                onClick={() => abrirModalEdicao(atleta)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Editar Dados
              </button>

              <button
                onClick={() => abrirModalFoto(atleta)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Alterar Foto
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      <EditarAtletaModal
        isOpen={modalAberto}
        atleta={atletaSelecionado}
        onClose={() => setModalAberto(false)}
        onAtualizado={fetchAtletas}
        token={token}
      />

      {/* Modal de foto */}
      {atletaSelecionado && (
        <AtualizarFotoModal
          isOpen={modalFotoAberto}
          onClose={() => setModalFotoAberto(false)}
          atleta={atletaSelecionado}
          onAtualizado={fetchAtletas}
          token={token}
        />
      )}
    </div>
  );
};

export default AtletasList;



/* import { useEffect, useState } from 'react';
import axios from 'axios';
import EditarAtletaModal from '@/components/EditarAtletaModal';

interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  categoria?: string;
  idade?: number;
  fotoUrl?: string;
  usuarioId: string;
}

const AtletasList = () => {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [token, setToken] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [role, setRole] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [atletaSelecionado, setAtletaSelecionado] = useState<Atleta | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) fetchAtletas();
  }, [token]);

  const fetchAtletas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/atleta/listarAtletas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAtletas(res.data.atletas || res.data);
      setUsuarioId(res.data.usuario?.id || '');
      setRole(res.data.usuario?.role || '');
    } catch (error) {
      console.error('Erro ao buscar atletas', error);
    }
  };

  const abrirModalEdicao = (atleta: Atleta) => {
    setAtletaSelecionado(atleta);
    setModalAberto(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Atletas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {atletas.map((atleta) => (
          <div
            key={atleta.id}
            className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center"
          >
            {atleta.fotoUrl && (
              <img
                src={atleta.fotoUrl}
                alt={atleta.nome}
                className="w-32 h-32 object-cover rounded-full mb-2"
              />
            )}
            <h2 className="text-lg font-semibold">{atleta.nome}</h2>
            <p>Idade: {atleta.idade}</p>
            <p>Categoria: {atleta.categoria}</p>
            <p>Gênero: {atleta.genero}</p>

            <button
              onClick={() => abrirModalEdicao(atleta)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* Modal de edição }
      <EditarAtletaModal
        isOpen={modalAberto}
        atleta={atletaSelecionado}
        onClose={() => setModalAberto(false)}
        onAtualizado={fetchAtletas}
        token={token}
      />
    </div>
  );
};

export default AtletasList; 


 */