import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: {
    id: string;
    name: string;
    password?: string;
  } | null;
  token: string;
  onAtualizado: () => void;
}

export default function EditarUsuarioModal({
  isOpen,
  onClose,
  usuario,
  token,
  onAtualizado,
}: EditarUsuarioModalProps) {
  const [id, setId] = useState('');
  const [name, setNome] = useState('');
  const [password, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Atualiza os campos quando a prop `usuario` mudar
  useEffect(() => {
    if (usuario) {
      setId(usuario.id);
      setNome(usuario.name);
    }
  }, [usuario]);

  const handleSalvar = async () => {
    setCarregando(true);
    setErro('');

    try {
      await axios.put(
        `http://localhost:3000/user/perfil`,
        { id, name, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onAtualizado();
      onClose();
    } catch (err) {
      console.error(err);
      setErro('Erro ao atualizar usuário');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 relative">
          {/* BACKDROP */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          </Transition.Child>

          {/* MODAL CONTENT */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="bg-white rounded-2xl p-6 z-50 w-full max-w-md shadow-lg">
              <Dialog.Title className="text-lg font-bold mb-4">Editar Usuário</Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium">Nome</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={name}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={password}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>

                {erro && <p className="text-red-600">{erro}</p>}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    onClick={onClose}
                    disabled={carregando}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSalvar}
                    disabled={carregando}
                  >
                    {carregando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
