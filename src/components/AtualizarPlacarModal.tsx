import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import axios from "axios";

interface Atleta {
  id: string;
  nome: string;
}

interface Partida {
  id: string;
  atleta1?: Atleta;
  atleta2?: Atleta;
  atleta3?: Atleta;
  atleta4?: Atleta;
  gamesTime1: number;
  gamesTime2: number;
}

interface AtualizarPlacarModalProps {
  isOpen: boolean;
  partida?: Partida;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AtualizarPlacarModal({
  isOpen,
  partida,
  token,
  onClose,
  onSuccess,
}: AtualizarPlacarModalProps) {
  if (!partida) return null;

  const [gamesTime1, setGamesTime1] = useState<number>(partida.gamesTime1 ?? 0);
  const [gamesTime2, setGamesTime2] = useState<number>(partida.gamesTime2 ?? 0);
  const [tiebreakTime1, setTiebreakTime1] = useState<number | null>(null);
  const [tiebreakTime2, setTiebreakTime2] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && partida) {
      setGamesTime1(partida.gamesTime1 ?? 0);
      setGamesTime2(partida.gamesTime2 ?? 0);
      setTiebreakTime1(null);
      setTiebreakTime2(null);
    }
  }, [isOpen, partida]);

  const handleSalvar = async () => {
    if (gamesTime1 == null || gamesTime2 == null) {
      alert("Informe o placar de games.");
      return;
    }

    if (gamesTime1 === 6 && gamesTime2 === 6) {
      alert("Placar 6x6 não é permitido. Use 7x6 ou 6x7 com tiebreak.");
      return;
    }

    const isTiebreak =
      (gamesTime1 === 7 && gamesTime2 === 6) ||
      (gamesTime1 === 6 && gamesTime2 === 7);

    if (isTiebreak) {
      if (tiebreakTime1 == null || tiebreakTime2 == null) {
        alert("Informe o placar do tiebreak.");
        return;
      }

      const v1 = tiebreakTime1;
      const v2 = tiebreakTime2;
      const vencedor = Math.max(v1, v2);
      const perdedor = Math.min(v1, v2);
      const diff = vencedor - perdedor;

      if (vencedor < 7) {
        alert("O tiebreak deve ir até pelo menos 7 pontos.");
        return;
      }

      if (diff < 2) {
        alert("O tiebreak precisa de pelo menos 2 pontos de diferença.");
        return;
      }
    } else {
      const vencedor = Math.max(gamesTime1, gamesTime2);
      const perdedor = Math.min(gamesTime1, gamesTime2);
      const diff = vencedor - perdedor;

      if (vencedor > 7 || diff < 2) {
        alert("Placar inválido: o vencedor deve ter no máximo 7 games e pelo menos 2 de vantagem.");
        return;
      }

      if (tiebreakTime1 || tiebreakTime2) {
        alert("Tiebreak só deve ser informado em caso de 7x6 ou 6x7.");
        return;
      }
    }

    try {
      await axios.put(
        `http://localhost:3000/partida/atualizarPlacar/${partida.id}/placar`,
        {
          gamesTime1,
          gamesTime2,
          tiebreakTime1,
          tiebreakTime2,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar placar", err);
      alert("Erro ao atualizar placar");
    }
  };

  const time1Label = `${partida.atleta1?.nome || "—"} / ${partida.atleta2?.nome || "—"}`;
  const time2Label = `${partida.atleta3?.nome || "—"} / ${partida.atleta4?.nome || "—"}`;
  const mostrarTiebreak =
    (gamesTime1 === 7 && gamesTime2 === 6) ||
    (gamesTime1 === 6 && gamesTime2 === 7);

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
                value={gamesTime1}
                onChange={(e) => setGamesTime1(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{time2Label}</label>
              <input
                type="number"
                value={gamesTime2}
                onChange={(e) => setGamesTime2(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {mostrarTiebreak && (
              <>
                <div>
                  <label className="block font-medium mb-1">Tiebreak {time1Label}</label>
                  <input
                    type="number"
                    value={tiebreakTime1 ?? ''}
                    onChange={(e) => setTiebreakTime1(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Tiebreak {time2Label}</label>
                  <input
                    type="number"
                    value={tiebreakTime2 ?? ''}
                    onChange={(e) => setTiebreakTime2(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
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
