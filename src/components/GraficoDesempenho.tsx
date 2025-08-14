import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Partida {
  id: string;
  data: string;
  atleta1?: { id: string; nome?: string };
  atleta2?: { id: string; nome?: string };
  atleta3?: { id: string; nome?: string };
  atleta4?: { id: string; nome?: string };
  gamesTime1: number | null;
  gamesTime2: number | null;
  tiebreakTime1?: number | null;
  tiebreakTime2?: number | null;
  local?: string;
}

interface Props {
  atletaId: string;
  partidas: Partida[];
}

export default function GraficoDesempenho({ atletaId, partidas }: Props) {
  const dataFormatada = useMemo(() => {
    const rows = partidas.map((p) => {
      const time1 = [p.atleta1?.id, p.atleta2?.id];
      const time2 = [p.atleta3?.id, p.atleta4?.id];
      const atletaNoTime1 = time1.includes(atletaId);
      const atletaNoTime2 = time2.includes(atletaId);

      if (!atletaNoTime1 && !atletaNoTime2) return null; // segurança

      const g1 = p.gamesTime1;
      const g2 = p.gamesTime2;
      const tb1 = p.tiebreakTime1 ?? null;
      const tb2 = p.tiebreakTime2 ?? null;

      if (g1 == null || g2 == null) return null; // sem placar ainda

      const isTieBreakScore = (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7);

      let resultado: 1 | -1 | null = null;

      if (isTieBreakScore) {
        // Se tiver tiebreak informado, usa-o para decidir
        if (tb1 != null && tb2 != null) {
          const ganhou = (tb1 > tb2 && atletaNoTime1) || (tb2 > tb1 && atletaNoTime2);
          resultado = ganhou ? 1 : -1;
        } else {
          // Sem tiebreak informado, decide pelo lado que tem 7
          const ganhou = (g1 === 7 && atletaNoTime1) || (g2 === 7 && atletaNoTime2);
          resultado = ganhou ? 1 : -1;
        }
      } else {
        // Partida normal (não 7x6/6x7)
        if (g1 === g2) return null; // ignora empates inválidos como 6x6
        const ganhou = (g1 > g2 && atletaNoTime1) || (g2 > g1 && atletaNoTime2);
        resultado = ganhou ? 1 : -1;
      }

      const labelPlacar = isTieBreakScore && tb1 != null && tb2 != null
        ? `${g1}x${g2} (${tb1}x${tb2})`
        : `${g1}x${g2}`;

      return {
        id: p.id,
        dataDate: new Date(p.data),
        dataStr: new Date(p.data).toLocaleDateString("pt-BR"),
        placar: labelPlacar,
        resultado,
        local: p.local ?? "",
      };
    });

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null && r.resultado !== null)
      .sort((a, b) => a.dataDate.getTime() - b.dataDate.getTime());
  }, [partidas, atletaId]);

  if (!dataFormatada.length) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mt-6">
        <h3 className="text-lg font-semibold mb-2">Desempenho por Partida</h3>
        <p className="text-sm text-gray-500">Sem partidas finalizadas para exibir ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Desempenho por Partida</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataFormatada}>
          <XAxis dataKey="dataStr" />
          <YAxis allowDecimals={false} domain={[-1, 1]} ticks={[-1, 0, 1]} />
          <Tooltip
            formatter={(value: any) => (value === 1 ? "Vitória" : "Derrota")}
            labelFormatter={(label, payload: any) => {
              const item = (payload && payload[0] && payload[0].payload) || null;
              if (!item) return label;
              return `${item.dataStr} — ${item.local || "Local não informado"} — ${item.placar}`;
            }}
          />
          <Bar dataKey="resultado">
            {dataFormatada.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.resultado === 1 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
