import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';


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

interface AtualizarFotoModalProps {
  atleta: Atleta | null;
  isOpen: boolean;
  onClose: () => void;
  onAtualizado: () => void;
  token: string;
}

export default function AtualizarFotoModal({ atleta, isOpen, onClose, onAtualizado, token }: AtualizarFotoModalProps) {
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  useEffect(() => {
  }, [isOpen, atleta]);

  if (!isOpen || !atleta) return null;

  const handleUpload = async () => {
    if (!novaFoto) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('foto', novaFoto);

      await fetch(`${API_BASE}/atleta/alteraFoto/${atleta.id}/foto`, {
        method: 'PUT',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      onAtualizado();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/50 px-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-bold">
            Atualizar Foto de {atleta.nome}
          </Dialog.Title>

          {atleta.fotoUrl && (
            <div className="flex justify-center">
              <img
                src={atleta.fotoUrl}
                alt="Foto atual"
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNovaFoto(e.target.files?.[0] ?? null)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleUpload}
              disabled={!novaFoto || loading}
            >
              {loading ? 'Enviando...' : 'Atualizar'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
