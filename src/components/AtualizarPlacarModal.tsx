// src/components/AtualizarPlacarModal.tsx
import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Partida } from "@/types/domain";

type AtualizarPlacarModalProps = {
  isOpen: boolean;
  partida?: Partida;     // agora aceita number | null (tipo do domínio)
  token: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AtualizarPlacarModal({
  isOpen,
  partida,
  token,
  onClose,
  onSuccess,
}: AtualizarPlacarModalProps) {
  if (!partida) return null;

  // inputs como string: permitem vazio e evitam NaN na digitação
  const [g1, setG1] = useState<string>("");
  const [g2, setG2] = useState<string>("");
  const [tb1, setTb1] = useState<string>("");
  const [tb2, setTb2] = useState<string>("");

  useEffect(() => {
    if (isOpen && partida) {
      setG1(partida.gamesTime1 != null ? String(partida.gamesTime1) : "");
      setG2(partida.gamesTime2 != null ? String(partida.gamesTime2) : "");
      setTb1(partida.tiebreakTime1 != null ? String(partida.tiebreakTime1) : "");
      setTb2(partida.tiebreakTime2 != null ? String(partida.tiebreakTime2) : "");
    }
  }, [isOpen, partida]);

  const numOrNull = (s: string): number | null =>
    s.trim() === "" ? null : Number(s);

  const g1Num = numOrNull(g1);
  const g2Num = numOrNull(g2);
  const tb1Num = numOrNull(tb1);
  const tb2Num = numOrNull(tb2);

  const isTiebreak =
    g1Num != null &&
    g2Num != null &&
    ((g1Num === 7 && g2Num === 6) || (g1Num === 6 && g2Num === 7));

  const time1Label = `${partida.atleta1?.nome || "—"} / ${partida.atleta2?.nome || "—"}`;
  const time2Label = `${partida.atleta3?.nome || "—"} / ${partida.atleta4?.nome || "—"}`;

  const handleSalvar = async () => {
    // validações básicas (mesmas ideias do backend, resumidas no front)
    if (g1Num == null || g2Num == null) {
      alert("Informe o placar de games (ambos os lados).");
      return;
    }

    if (g1Num === 6 && g2Num === 6) {
      alert("Placar 6x6 não é permitido. Use 7x6 ou 6x7 com tiebreak.");
      return;
    }

    if (isTiebreak) {
      if (tb1Num == null || tb2Num == null) {
        alert("Informe o placar do tiebreak.");
        return;
      }
      const maior = Math.max(tb1Num, tb2Num);
      const diff = Math.abs(tb1Num - tb2Num);
      if (maior < 7) {
        alert("O tiebreak deve ir até pelo menos 7 pontos.");
        return;
      }
      if (diff < 2) {
        alert("O tiebreak precisa de pelo menos 2 pontos de diferença.");
        return;
      }
    } else {
      // sem tiebreak: 6–0..6–4 (dif ≥ 2) ou 7–5
      const vencedor = Math.max(g1Num, g2Num);
      const perdedor = Math.min(g1Num, g2Num);
      const dif = vencedor - perdedor;

      const validoSemTB =
        (vencedor === 6 && dif >= 2) ||
        (vencedor === 7 && ((g1Num === 7 && g2Num === 5) || (g2Num === 7 && g1Num === 5)));

      if (!validoSemTB) {
        alert("Sem tiebreak, o válido é 6–0..6–4 (dif ≥2) ou 7–5.");
        return;
      }

      if (tb1Num != null || tb2Num != null) {
        alert("Tiebreak só deve ser informado em caso de 7x6 ou 6x7.");
        return;
      }
    }

    try {
      await api.put(
        `/partida/atualizarPlacar/${partida.id}/placar`,
        {
          gamesTime1: g1Num,
          gamesTime2: g2Num,
          tiebreakTime1: isTiebreak ? tb1Num : null,
          tiebreakTime2: isTiebreak ? tb2Num : null,
        },
        { headers: { Authorization: `Bearer ${token}` } } // remova se usa interceptor
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar placar", err);
      alert("Erro ao atualizar placar");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">Atualizar Placar</Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">{time1Label}</label>
              <input
                type="number"
                inputMode="numeric"
                value={g1}
                onChange={(e) => setG1(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Games do time 1"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{time2Label}</label>
              <input
                type="number"
                inputMode="numeric"
                value={g2}
                onChange={(e) => setG2(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Games do time 2"
              />
            </div>

            {isTiebreak && (
              <>
                <div>
                  <label className="block font-medium mb-1">Tiebreak {time1Label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={tb1}
                    onChange={(e) => setTb1(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Pontos do tiebreak (time 1)"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Tiebreak {time2Label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={tb2}
                    onChange={(e) => setTb2(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Pontos do tiebreak (time 2)"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
