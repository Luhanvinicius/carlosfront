import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Atleta {
  id: string;
  nome: string;
}

interface NovaPartidaModalProps {
  isOpen: boolean;
  token: string;
  atletaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NovaPartidaModal({
  isOpen,
  token,
  atletaId,
  onClose,
  onSuccess,
}: NovaPartidaModalProps) {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [form, setForm] = useState({
    atleta1Id: atletaId,
    atleta2Id: "",
    atleta3Id: "",
    atleta4Id: "",
    formato: "6games",
    data: "",
    hora: "",      // 👈 novo
    local: "",
  });

  const carregarAtletas = async () => {
    try {
      const response = await api.get("/atleta/listarAtletasPaginados", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setAtletas(response.data);
      } else {
        console.error("Formato inesperado de atletas:", response.data);
        setAtletas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarAtletas();
      setForm({
        atleta1Id: atletaId,
        atleta2Id: "",
        atleta3Id: "",
        atleta4Id: "",
        formato: "6games",
        data: "",
        hora: "",   // reset
        local: "",
      });
    }
  }, [isOpen, atletaId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // validações básicas
    if (!form.atleta2Id || !form.atleta3Id || !form.atleta4Id) {
      alert("Selecione os atletas 2, 3 e 4.");
      return;
    }
    if (!form.data) {
      alert("Informe a data da partida.");
      return;
    }
    if (!form.hora) {
      alert("Informe a hora da partida.");
      return;
    }
    if (!form.local.trim()) {
      alert("Informe o local da partida.");
      return;
    }

    // Monta datetime local (sem 'Z') para evitar shift de fuso no backend
    const dataHoraLocal = `${form.data}T${form.hora}:00`;

    try {
      await api.post(
        "/partida/criarPartida",
        {
          ...form,
          data: dataHoraLocal, // 👈 envia data+hora combinadas
          torneioId: null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar partida:", error);
      alert("Erro ao criar partida");
    }
  };

  const isDisabled =
    !form.atleta2Id || !form.atleta3Id || !form.atleta4Id || !form.data || !form.hora || !form.local.trim();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">Nova Partida Amistosa</Dialog.Title>

          <div className="space-y-4">
            {[2, 3, 4].map((i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-1">Atleta {i}</label>
                <select
                  name={`atleta${i}Id`}
                  value={(form as any)[`atleta${i}Id`]}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Selecione um atleta</option>
                  {atletas
                    .filter((a) => a.id !== atletaId)
                    .map((atleta) => (
                      <option key={atleta.id} value={atleta.id}>
                        {atleta.nome}
                      </option>
                    ))}
                </select>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">Formato</label>
              <select
                name="formato"
                value={form.formato}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              >
                <option value="6games">Até 6 games + tiebreak até 7</option>
                <option value="itf">2 sets até 6 + super tiebreak até 10</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Local</label>
              <input
                type="text"
                name="local"
                value={form.local}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isDisabled}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Criar Partida
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
