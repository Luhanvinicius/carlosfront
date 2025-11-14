// src/components/AtletaModal.tsx
import { useState } from "react";
import { api } from "@/lib/api";
import type { FC } from "react";            // type-only p/ verbatimModuleSyntax
import type { Atleta } from "@/types/domain"; // ajuste se seu tipo estiver em outro lugar

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  atleta?: Atleta | null;            // opcional no modo "criar"
  mode?: "criar" | "editar";         // restringe
  /** DEPRECATED: Authorization vem do interceptor (BASIC/JWT) */
  token?: string;
};

const AtletaModal: FC<Props> = ({ isOpen, onClose, onSuccess, atleta, mode = "criar" }) => {
  const [form, setForm] = useState<Partial<Atleta>>(() => ({
    nome: atleta?.nome ?? "",
    genero: atleta?.genero,
    categoria: atleta?.categoria,
    fone: atleta?.fone,
    dataNascimento: atleta?.dataNascimento,
  }));
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErro("");
    try {
      if (mode === "editar" && atleta?.id) {
        await api.put(`/atleta/altera/${atleta.id}`, {
          ...form,
          genero: form.genero || undefined,
          fone: form.fone || undefined,
          categoria: form.categoria || undefined,
          dataNascimento: form.dataNascimento || undefined,
        }, { validateStatus: s => s >= 200 && s < 300 });
      } else {
        await api.post("/atleta/criar", {
          ...form,
          genero: form.genero || undefined,
          fone: form.fone || undefined,
          categoria: form.categoria || undefined,
          dataNascimento: form.dataNascimento || undefined,
        }, { validateStatus: s => s >= 200 && s < 300 });
      }
      await onSuccess?.();
      onClose();
    } catch (err: any) {
      setErro(err?.response?.data?.mensagem || "Erro ao salvar atleta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="bg-white rounded-xl p-4 w-full max-w-md grid gap-3">
        <h3 className="text-lg font-semibold">
          {mode === "editar" ? "Editar perfil de atleta" : "Criar perfil de atleta"}
        </h3>

        <input
          className="border rounded p-2"
          placeholder="Nome"
          value={form.nome ?? ""}
          onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
          required
        />
        <input
          className="border rounded p-2"
          placeholder="Categoria"
          value={form.categoria ?? ""}
          onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
        />
        <input
          className="border rounded p-2"
          placeholder="Telefone"
          value={form.fone ?? ""}
          onChange={(e) => setForm(f => ({ ...f, fone: e.target.value }))}
        />

        {erro && <p className="text-red-600 text-sm">{erro}</p>}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancelar</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white" disabled={saving || !(form.nome ?? "").trim()}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AtletaModal;
