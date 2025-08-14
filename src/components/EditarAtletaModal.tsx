import { useState, useEffect } from 'react';
import axios from 'axios';

interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  fone?: string;
  categoria?: string;
}

interface EditarAtletaModalProps {
  atleta: Atleta | null;
  isOpen: boolean;
  onClose: () => void;
  onAtualizado: () => void;
  token: string;
}

const EditarAtletaModal = ({
  atleta,
  isOpen,
  onClose,
  onAtualizado,
  token,
}: EditarAtletaModalProps) => {
  const [form, setForm] = useState({
    nome: '',
    dataNascimento: '',
    genero: '',
    fone: '',
    categoria: '',
  });

  useEffect(() => {
    if (atleta) {
      setForm({
        nome: atleta.nome,
        dataNascimento: atleta.dataNascimento.slice(0, 10),
        genero: atleta.genero || '',
        fone: atleta.fone || '',
        categoria: atleta.categoria || '',
      });
    }
  }, [atleta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'fone') {
      const masked = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
      setForm({ ...form, fone: masked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSalvar = async () => {
    try {
      console.log(token);
      await axios.put(`http://localhost:3000/atleta/altera/${atleta?.id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onAtualizado();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar atleta', error);
    }
  };

  if (!isOpen || !atleta) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar Atleta</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={form.dataNascimento}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Gênero</label>
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Telefone</label>
            <input
              type="text"
              name="fone"
              value={form.fone}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(99) 99999-9999"
            />
          </div>

          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Categoria</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              <option value="INICIANTE">Iniciante</option>
              <option value="INTERMEDIARIO">Intermediário</option>
              <option value="AVANCADO">Avançado</option>
              <option value="PRO">Pro</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarAtletaModal;
