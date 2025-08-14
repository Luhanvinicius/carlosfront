import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AtletaForm {
  nome: string;
  dataNascimento: string;
  genero: string;
  categoria: string;
}

const PreencherPerfilAtleta = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AtletaForm>({
    nome: '',
    dataNascimento: '',
    genero: '',
    categoria: '',
  });

  const [token, setToken] = useState('');
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return navigate('/login');

    setToken(storedToken);
    verificarSeJaTemAtleta(storedToken);
  }, []);

  const verificarSeJaTemAtleta = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:3000/atleta/me/atleta', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 && res.data) {
        navigate('/dashboard'); // Já tem atleta → redireciona
      } else {
        setVerificando(false); // Não tem → mostra formulário
      }
    } catch (error: any) {
      if (error.response?.status === 204) {
        setVerificando(false); // 204 = não tem atleta
      } else {
        console.error('Erro ao verificar atleta:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:3000/atleta/criarAtleta', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao criar atleta:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    }
  };

  if (verificando) return <p className="p-4">Verificando perfil de atleta...</p>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">Preencha seu perfil de atleta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="dataNascimento"
          value={form.dataNascimento}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="genero"
          value={form.genero}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecione o gênero</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
        </select>
        <input
          type="text"
          name="categoria"
          placeholder="Categoria (ex: A, B, Iniciante...)"
          value={form.categoria}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Salvar Perfil
        </button>
      </form>
    </div>
  );
};

export default PreencherPerfilAtleta;
