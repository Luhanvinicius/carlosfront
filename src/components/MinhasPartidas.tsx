import { useState } from "react";
import NovaPartidaModal from "./NovaPartidaModal";
import AtualizarPlacarModal from "./AtualizarPlacarModal";

interface Atleta {
  id: string;
  nome: string;
}

interface Partida {
  id: string;
  data: string;
  local: string;
  atleta1?: Atleta;
  atleta2?: Atleta;
  atleta3?: Atleta;
  atleta4?: Atleta;
  gamesTime1: number | null;
  gamesTime2: number | null;
  tiebreakTime1?: number | null;
  tiebreakTime2?: number | null;
}

interface Props {
  token: string;
  atletaId: string;
  partidas: Partida[]; // já filtradas no pai
  onAbrirTodas: () => void;
  onNovaPartida: () => void;
  onAtualizarPlacar: (partida: Partida) => void;
}

export default function MinhasPartidasCompacta({
  token,
  atletaId,
  partidas,
  onAbrirTodas,
  onNovaPartida,
  onAtualizarPlacar,
}: Props) {
  const [showCardId, setShowCardId] = useState<string | null>(null);
  const [modalNovaAberto, setModalNovaAberto] = useState(false);

  const formatarPlacar = (p: Partida) => {
    if (p.gamesTime1 == null || p.gamesTime2 == null) return "Ainda não informado";
    let base = `${p.gamesTime1} x ${p.gamesTime2}`;
    if (p.gamesTime1 === 6 && p.gamesTime2 === 6 && p.tiebreakTime1 != null && p.tiebreakTime2 != null) {
      base += ` (${p.tiebreakTime1} x ${p.tiebreakTime2})`;
    }
    return base;
  };

  const resultadoEmoji = (p: Partida): string => {
    const time1 = [p.atleta1?.id, p.atleta2?.id];
    const time2 = [p.atleta3?.id, p.atleta4?.id];
    const atletaNoTime1 = time1.includes(atletaId);
    const atletaNoTime2 = time2.includes(atletaId);

    if (p.gamesTime1 == null || p.gamesTime2 == null) return "⚪";

    if (p.gamesTime1 === 6 && p.gamesTime2 === 6) {
      if (p.tiebreakTime1 != null && p.tiebreakTime2 != null) {
        if (p.tiebreakTime1 > p.tiebreakTime2 && atletaNoTime1) return "🟢";
        if (p.tiebreakTime2 > p.tiebreakTime1 && atletaNoTime2) return "🟢";
        if (p.tiebreakTime1 < p.tiebreakTime2 && atletaNoTime1) return "🔴";
        if (p.tiebreakTime2 < p.tiebreakTime1 && atletaNoTime2) return "🔴";
      }
      return "⚪";
    }

    if (p.gamesTime1 > p.gamesTime2 && atletaNoTime1) return "🟢";
    if (p.gamesTime2 > p.gamesTime1 && atletaNoTime2) return "🟢";
    if (p.gamesTime1 < p.gamesTime2 && atletaNoTime1) return "🔴";
    if (p.gamesTime2 < p.gamesTime1 && atletaNoTime2) return "🔴";

    return "⚪";
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Minhas Últimas Partidas</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setModalNovaAberto(true)}
            className="text-sm text-green-600 hover:underline"
          >
            + Nova Partida
          </button>
          <button
            onClick={onAbrirTodas}
            className="text-sm text-blue-600 hover:underline"
          >
            Ver todas
          </button>
        </div>
      </div>

      {partidas.length === 0 ? (
        <p className="text-sm text-gray-500">Você ainda não participou de nenhuma partida.</p>
      ) : (
        <ul className="space-y-3">
          {partidas.slice(0, 5).map((p) => (
            <li key={p.id} className="border rounded p-3 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span>{resultadoEmoji(p)}</span>
                <span className="text-gray-600">
                  {new Date(p.data).toLocaleDateString("pt-BR")} - {p.local}
                </span>
              </div>
              <div>
                <p className="font-medium">
                  {p.atleta1?.nome || "—"} / {p.atleta2?.nome || "—"} × {p.atleta3?.nome || "—"} / {p.atleta4?.nome || "—"}
                </p>
                <p>Placar: {formatarPlacar(p)}</p>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button
                  onClick={() => onAtualizarPlacar(p)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Atualizar placar
                </button>
                <button
                  onClick={() => setShowCardId(p.id)}
                  className="text-green-600 hover:underline text-xs"
                >
                  Ver Card
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showCardId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 relative max-w-[90vw] max-h-[90vh] overflow-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
              onClick={() => setShowCardId(null)}
            >
              ✕
            </button>
            <img
              src={`http://localhost:3000/partida/cardPromocional/${showCardId}/card`}
              alt="Card da Partida"
              className="max-w-full max-h-[70vh] rounded mb-4"
            />
            <div className="text-center">
              <a
                href={`http://localhost:3000/partida/cardPromocional/${showCardId}/card`}
                download={`card_partida_${showCardId}.png`}
                className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded"
              >
                📥 Baixar Card
              </a>
            </div>
          </div>
        </div>
      )}

      {modalNovaAberto && (
        <NovaPartidaModal
          isOpen={modalNovaAberto}
          token={token}
          atletaId={atletaId}
          onClose={() => setModalNovaAberto(false)}
          onSuccess={() => {
            onNovaPartida();
            setModalNovaAberto(false);
          }}
        />
      )}
    </div>
  );
}
