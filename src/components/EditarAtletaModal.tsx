// src/components/EditarAtletaModal.tsx
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Atleta } from "@/types/domain";

type EditarAtletaModalProps = {
  atleta: Atleta | null;
  isOpen: boolean;
  onClose: () => void;
  onAtualizado: () => void;
  /** DEPRECATED: não é usado (Authorization vem do interceptor) */
  token?: string;
};

const EditarAtletaModal = ({
  atleta,
  isOpen,
  onClose,
  onAtualizado,
}: EditarAtletaModalProps) => {
  const [form, setForm] = useState({
    nome: "",
    dataNascimento: "", // yyyy-mm-dd
    genero: "",
    fone: "",
    categoria: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !atleta) return;

    const dn = atleta.dataNascimento
      ? new Date(atleta.dataNascimento).toISOString().slice(0, 10)
      : "";

    setForm({
      nome: atleta.nome ?? "",
      dataNascimento: dn,
      genero: atleta.genero ?? "",
      fone: atleta.fone ?? "",
      categoria: atleta.categoria ?? "",
    });
    setErro("");
  }, [isOpen, atleta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "fone") {
      const masked = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
      setForm((prev) => ({ ...prev, fone: masked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSalvar = async () => {
    if (!atleta?.id) return;
    setSalvando(true);
    setErro("");

    try {
      await api.put(
        `/atleta/altera/${atleta.id}`,
        {
          ...form,
          // evita sobrescrever com string vazia
          genero: form.genero || undefined,
          fone: form.fone || undefined,
          categoria: form.categoria || undefined,
          dataNascimento: form.dataNascimento || undefined,
        },
        {
          // Authorization vem do interceptor (Basic/JWT)
          validateStatus: (s) => s >= 200 && s < 300,
        }
      );

      onAtualizado();
      onClose();
    } catch (error: any) {
      setErro(error?.response?.data?.mensagem || "Erro ao atualizar atleta");
      console.error("Erro ao atualizar atleta", error);
    } finally {
      setSalvando(false);
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

        {erro && <p className="text-red-600 mt-4">{erro}</p>}

        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarAtletaModal;
