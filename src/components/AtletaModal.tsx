import { useState, useEffect } from 'react';
import axios from 'axios';

interface Atleta {
  id?: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  fone?: string;
  categoria?: string;
}

type Mode = 'criar' | 'editar';

interface AtletaModalProps {
  atleta?: Atleta | null;
  mode: Mode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const AtletaModal = ({
  atleta,
  mode,
  isOpen,
  onClose,
  onSuccess,
  token,
}: AtletaModalProps) => {
  const [form, setForm] = useState({
    nome: '',
    dataNascimento: '',
    genero: '',
    fone: '',
    categoria: '',
  });

  useEffect(() => {
    if (mode === 'editar' && atleta) {
      setForm({
        nome: atleta.nome,
        dataNascimento: atleta.dataNascimento.slice(0, 10),
        genero: atleta.genero || '',
        fone: atleta.fone || '',
        categoria: atleta.categoria || '',
      });
    } else if (mode === 'criar') {
      setForm({
        nome: '',
        dataNascimento: '',
        genero: '',
        fone: '',
        categoria: '',
      });
    }
  }, [mode, atleta]);

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
      if (mode === 'editar' && atleta?.id) {
        await axios.put(`http://localhost:3000/atleta/altera/${atleta.id}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (mode === 'criar') {
        console.log(form);
        await axios.post('http://localhost:3000/atleta/CriarAtleta', form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Erro ao ${mode === 'criar' ? 'criar' : 'editar'} atleta`, error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {mode === 'criar' ? 'Criar Perfil de Atleta' : 'Editar Atleta'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              required
            />
          </div>

          <div className="flex items-center">
            <label className="w-32 font-medium text-gray-700">Gênero</label>
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              required
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

export default AtletaModal;
