import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EditarAtletaModal from "../components/EditarAtletaModal";
import MinhasPartidas from "../components/MinhasPartidas";
import MinhasPartidasCompacta from "../components/MinhasPartidasCompacta";
import AtualizarPlacarModal from "../components/AtualizarPlacarModal";
import GraficoEvolutivo from "../components/GraficoEvolutivo";

interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  fone?: string;
  categoria?: string;
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

type Periodo = "all" | "30" | "90" | "365";

export default function Dashboard() {
  const [token, setToken] = useState("");
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [mostrarPartidas, setMostrarPartidas] = useState(false);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [modalPlacar, setModalPlacar] = useState(false);
  const [partidaSelecionada, setPartidaSelecionada] = useState<Partida | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // novo: período do gráfico e peso do TB
  const [periodo, setPeriodo] = useState<Periodo>("all");
  const [tbWeight, setTbWeight] = useState<number>(0.1);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      buscarAtleta();
    }
  }, [token]);

  useEffect(() => {
    if (token && atleta?.id) {
      carregarPartidas();
    }
  }, [token, atleta?.id]);

  const buscarAtleta = async () => {
    try {
      const res = await axios.get("http://localhost:3000/atleta/me/atleta", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtleta(res.data);
    } catch (error) {
      console.error("Erro ao buscar atleta", error);
    }
  };

  const carregarPartidas = async () => {
    if (!atleta?.id) return;

    try {
      const res = await axios.get("http://localhost:3000/partida/listarPartidas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const doAtleta = res.data
        .filter((p: Partida) =>
          [p.atleta1?.id, p.atleta2?.id, p.atleta3?.id, p.atleta4?.id].includes(atleta.id)
        )
        .sort((a: Partida, b: Partida) => new Date(b.data).getTime() - new Date(a.data).getTime());

      setPartidas(doAtleta);
    } catch (err) {
      console.error("Erro ao carregar partidas", err);
    }
  };

  // filtra por período para o gráfico
  const partidasPeriodo = useMemo(() => {
    if (periodo === "all") return partidas;

    const days = Number(periodo);
    const now = new Date().getTime();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return partidas.filter((p) => new Date(p.data).getTime() >= cutoff);
  }, [partidas, periodo]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>

      {atleta && (
        <>
          <MinhasPartidasCompacta
            token={token}
            atletaId={atleta.id}
            partidas={partidas}
            onAbrirTodas={() => setMostrarPartidas(true)}
            onAtualizarPlacar={(p) => {
              setPartidaSelecionada(p);
              setModalPlacar(true);
            }}
            onNovaPartida={carregarPartidas}
            pageSize={5}
          />

          {/* Controles do gráfico */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setMostrarGrafico((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {mostrarGrafico ? "Ocultar Desempenho" : "Ver Desempenho"}
            </button>

            {mostrarGrafico && (
              <>
                <label className="text-sm text-gray-700">
                  Período:{" "}
                  <select
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value as Periodo)}
                    className="ml-1 border rounded px-2 py-1"
                  >
                    <option value="all">Todos</option>
                    <option value="30">30 dias</option>
                    <option value="90">90 dias</option>
                    <option value="365">365 dias</option>
                  </select>
                </label>

                <label className="text-sm text-gray-700 flex items-center gap-2">
                  Peso do TB:
                  <input
                    type="range"
                    min={0}
                    max={0.25}
                    step={0.05}
                    value={tbWeight}
                    onChange={(e) => setTbWeight(Number(e.target.value))}
                  />
                  <span className="text-xs text-gray-600 w-10 text-right">
                    {tbWeight.toFixed(2)}
                  </span>
                </label>
              </>
            )}
          </div>

          {mostrarGrafico && partidasPeriodo.length > 0 && (
            <div className="mt-2">
              <GraficoEvolutivo
                partidas={partidasPeriodo}
                atletaId={atleta.id}
                tbWeight={tbWeight}
                title={
                  periodo === "all"
                    ? "Evolução do Atleta — Todas as partidas"
                    : `Evolução do Atleta — Últimos ${periodo} dias`
                }
              />
            </div>
          )}

          {mostrarPartidas && (
            <MinhasPartidas
              token={token}
              atletaId={atleta.id}
            />
          )}

          {modalPlacar && partidaSelecionada && (
            <AtualizarPlacarModal
              isOpen={modalPlacar}
              partida={partidaSelecionada}
              token={token}
              onClose={() => {
                setModalPlacar(false);
                setPartidaSelecionada(null);
              }}
              onSuccess={() => {
                carregarPartidas();
              }}
            />
          )}

          <EditarAtletaModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAtualizado={buscarAtleta}
            token={token}
            atleta={atleta}
          />
        </>
      )}
    </div>
  );
}
