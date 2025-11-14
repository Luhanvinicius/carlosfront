// src/views/Perfil.tsx
import { useEffect, useState } from "react";
import EditarUsuarioModal from "@/components/EditarUsuarioModal";
import AtualizarFotoModal from "@/components/AtualizarFotoModal";
import EditarAtletaModal from "@/components/EditarAtletaModal";
import AtletaModal from "@/components/AtletaModal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  // Compat com modais que ainda recebem 'token' (Authorization vem do interceptor)
  const [token, setToken] = useState<string>("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [atleta, setAtleta] = useState<Atleta | null>(null);

  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [modalEditarAtleta, setModalEditarAtleta] = useState(false);
  const [modalEditarFoto, setModalEditarFoto] = useState(false);
  const [modalAtletaModal, setModalAtleta] = useState(false);

  const auth: any = useAuth();
  const authReady: boolean =
    typeof auth?.authReady === "boolean" ? auth.authReady : true;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (auth?.usuario) {
      fetchUsuario();
      fetchAtleta();
    } else {
      setUsuario(null);
      setAtleta(null);
    }
  }, [authReady, auth?.usuario]);

  const fetchUsuario = async () => {
    try {
      const res = await api.get("/user/getUsuarioLogado", {
        validateStatus: (s) => s >= 200 && s < 300,
      });
      setUsuario(res.data);
    } catch (error) {
      console.error("Erro ao buscar usuário", error);
      setUsuario(null);
    }
  };

  const fetchAtleta = async () => {
    try {
      const res = await api.get("/atleta/me/atleta", {
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
      });

      if (res.status === 204 || !res.data) {
        setAtleta(null);
        return;
      }
      setAtleta(res.data);
    } catch (error) {
      console.error("Erro ao buscar atleta", error);
      setAtleta(null);
    }
  };

  if (authReady === false) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        <div className="animate-pulse bg-gray-100 h-24 rounded mb-4" />
        <div className="animate-pulse bg-gray-100 h-56 rounded" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      {/* Usuário */}
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

      {/* Atleta */}
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
        token={token}        // compat: remover quando o modal usar só api/interceptor
        usuario={usuario}
      />

      <EditarAtletaModal
        atleta={atleta}
        isOpen={modalEditarAtleta}
        onClose={() => setModalEditarAtleta(false)}
        onAtualizado={fetchAtleta}
        token={token}        // compat
      />

      <AtletaModal
        atleta={atleta}
        mode="criar"
        isOpen={modalAtletaModal}
        onClose={() => setModalAtleta(false)}
        onSuccess={fetchAtleta}
        token={token}        // compat
      />

      <AtualizarFotoModal
        isOpen={modalEditarFoto}
        onClose={() => setModalEditarFoto(false)}
        onAtualizado={fetchAtleta}
        token={token}        // compat
        atleta={atleta}
      />
    </div>
  );
};

export default Perfil;
