// src/pages/PreencherPerfilAtleta.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface AtletaForm {
  nome: string;
  dataNascimento: string; // yyyy-mm-dd
  genero: string;         // MASCULINO | FEMININO | OUTRO (normalizado no submit)
  categoria: string;
}

const PreencherPerfilAtleta = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<AtletaForm>({
    nome: "",
    dataNascimento: "",
    genero: "",
    categoria: "",
  });

  const [token, setToken] = useState("");
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const init = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        navigate("/login", { replace: true });
        return;
      }

      setToken(storedToken);

      try {
        const res = await api.get("/atleta/me/atleta", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (cancelado) return;

        // Se 200 com dados → já tem atleta, redireciona
        if (res.status === 200 && res.data) {
          navigate("/dashboard", { replace: true });
          return;
        }

        // Caso contrário, libera o formulário
        setVerificando(false);
      } catch (error: any) {
        if (cancelado) return;

        // 204 = não tem atleta → mostra formulário
        if (error?.response?.status === 204) {
          setVerificando(false);
        } else {
          console.error("Erro ao verificar atleta:", error);
          // Ainda assim liberar formulário para tentar criar
          setVerificando(false);
        }
      }
    };

    init();

    return () => {
      cancelado = true;
    };
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Normaliza o genero para o backend (se ele espera em CAPS)
    const payload = {
      ...form,
      genero: form.genero ? form.genero.toUpperCase() : "",
    };

    try {
      await api.post("/atleta/criarAtleta", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Erro ao criar atleta:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    }
  };

  if (verificando) {
    return <p className="p-4">Verificando perfil de atleta...</p>;
  }

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
          <option value="MASCULINO">Masculino</option>
          <option value="FEMININO">Feminino</option>
          <option value="OUTRO">Outro</option>
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
