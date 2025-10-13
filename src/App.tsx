import { useEffect, useMemo, useState } from "react";

type Price = {
  custo?: number | null;
  margem?: number | null;
  impostos?: number | null;
  over?: number | null;
};
type Item = {
  venda: string;
  plano: string;
  modelo: string;
  hour: number;
  tipo: string;
  codigo: string;
  descricao: string;
  precos: Price;
};
type DataShape = { machines: string[]; hours: number[]; items: Item[] };

export default function App() {
  const [data, setData] = useState<DataShape | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/data/maintenance.json", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j: DataShape = await res.json();
        setData(j);
        setSelectedModel(j.machines[0] ?? "");
        setSelectedHour(j.hours[0] ?? null);
      } catch (e: any) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!data || !selectedModel || !selectedHour) return [];
    return data.items
      .filter((it) => it.modelo === selectedModel && it.hour <= selectedHour)
      .sort((a, b) => a.hour - b.hour || a.codigo.localeCompare(b.codigo));
  }, [data, selectedModel, selectedHour]);

  const totalCusto = useMemo(
    () => filtered.reduce((s, it) => s + (it.precos.custo || 0), 0),
    [filtered]
  );
  const totalOver = useMemo(
    () => filtered.reduce((s, it) => s + (it.precos.over || 0), 0),
    [filtered]
  );

  if (loading)
    return (
      <main className="min-h-dvh grid place-items-center bg-slate-950 text-slate-100">
        Carregando…
      </main>
    );
  if (err)
    return (
      <main className="min-h-dvh grid place-items-center bg-slate-950 text-red-400">
        Erro: {err}
      </main>
    );
  if (!data) return null;

  return (
    <main className="h-dvh overflow-hidden pb-16 bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra superior “Tipo de Venda” — espaço reservado */}
      {/* <header className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="h-10 rounded-lg bg-slate-900/60 border border-slate-800" />
        </div>
      </header> */}

      <section className="mx-auto max-w-7xl px-4 py-6">
        {/* Carrossel de máquinas */}
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-3">
            {data.machines.map((m) => {
              const active = m === selectedModel;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={`shrink-0 px-4 py-2 rounded-xl border ${
                    active
                      ? "bg-yellow-400 text-slate-900 border-yellow-300"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chips de horas */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.hours.map((h) => {
            const active = h === selectedHour;
            return (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  active
                    ? "bg-yellow-400 text-slate-900 border-yellow-300"
                    : "bg-yellow-600/20 border-yellow-500/30 hover:bg-yellow-600/30"
                }`}
              >
                {h.toString().padStart(4, "0")}H
              </button>
            );
          })}
        </div>

        {/* Linha de filtros no topo — espaço reservado */}
        {/* <div className="mt-6 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <div className="h-14 rounded-xl border border-slate-800 bg-slate-900/60" />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="h-14 rounded-xl border border-slate-800 bg-slate-900/60" />
          </div>
        </div> */}

        {/* Corpo principal */}
        <div className="mt-6 grid grid-cols-12 gap-6 h-[70vh]">
          {/* Coluna esquerda com filtros verticais — espaço reservado mantendo largura */}
          <aside className="hidden lg:block col-span-3 ">
            <div className="h-[540px] rounded-2xl border border-slate-800 bg-slate-900/60" />
          </aside>

          {/* Lista de Itens */}
          <section className="col-span-12 lg:col-span-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col h-[70vh]">
              {/* Cabeçalho */}
              <div className="px-4 py-3 border-b border-slate-800 shrink-0">
                <h2 className="text-base font-semibold tracking-tight">
                  Lista de Itens
                </h2>
                <p className="text-sm text-slate-400">
                  {selectedModel} • até {String(selectedHour).padStart(4, "0")}H
                  • {filtered.length} itens
                </p>
              </div>

              {/* Tabela com rolagem */}
              <div className="flex-1 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-slate-950 text-slate-200 shadow">
                    <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:whitespace-nowrap border-b border-slate-800">
                      <th>Venda</th>
                      <th>Plano</th>
                      <th>Modelo</th>
                      <th>Revisão</th>
                      <th>Tipo</th>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th className="text-right">Custo</th>
                      <th className="text-right">Over</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((it, idx) => (
                      <tr
                        key={`${it.codigo}-${idx}`}
                        className="odd:bg-slate-900/30 border-b border-slate-900/40"
                      >
                        <td className="px-3 py-2">{it.venda}</td>
                        <td className="px-3 py-2">{it.plano}</td>
                        <td className="px-3 py-2">{it.modelo}</td>
                        <td className="px-3 py-2">
                          {String(it.hour).padStart(4, "0")}H
                        </td>
                        <td className="px-3 py-2">{it.tipo}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {it.codigo}
                        </td>
                        <td className="px-3 py-2">{it.descricao}</td>
                        <td className="px-3 py-2 text-right">
                          {fmt(it.precos.custo)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {fmt(it.precos.over)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé fixo */}
              <div className="border-t border-slate-800 bg-slate-950/60 px-3 py-3 shrink-0">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span className="text-right">
                    {fmt(totalCusto)} → {fmt(totalOver)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Coluna direita com cards de totais — espaço reservado visual */}
          <aside className="hidden lg:block col-span-3">
            <div className="space-y-4">
              <div className="h-28 rounded-2xl border border-slate-800 bg-slate-900/60" />
              <div className="h-28 rounded-2xl border border-slate-800 bg-slate-900/60" />
              <div className="h-28 rounded-2xl border border-slate-800 bg-slate-900/60" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function fmt(n?: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
