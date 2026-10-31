"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getAtendimentos, getClinicas, getPacientes, ordenarCronologico } from "@/lib/storage";
import { formatarDataBR, hojeISO, inicioMes } from "@/lib/data";
import { ROTULO_TIPO, descreverLocal } from "@/lib/local";
import { exportarExcel, exportarPDF, resumoPorProcedimento } from "@/lib/export";
import { Atendimento, Clinica, TipoAtendimento } from "@/lib/types";

type FiltroPago = "todos" | "pagos" | "pendentes";

export default function RelatoriosPage() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [tipo, setTipo] = useState<"" | TipoAtendimento>("");
  const [pago, setPago] = useState<FiltroPago>("todos");

  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [nomesProc, setNomesProc] = useState<string[]>([]);
  const [resultado, setResultado] = useState<Atendimento[] | null>(null);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [exportando, setExportando] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    setClinicas(getClinicas());
    // Procedimentos que realmente aparecem nos lançamentos (inclui os já removidos do cadastro).
    const usados = new Set<string>();
    for (const a of getAtendimentos()) if (a.procedimentoNome) usados.add(a.procedimentoNome);
    setNomesProc(Array.from(usados).sort((x, y) => x.localeCompare(y, "pt-BR")));
    const hoje = hojeISO();
    setDe(inicioMes(hoje));
    setAte(hoje);
  }, []);

  function visualizar() {
    let lista = getAtendimentos();
    if (de) lista = lista.filter((a) => a.data >= de);
    if (ate) lista = lista.filter((a) => a.data <= ate);
    if (clinicaId) lista = lista.filter((a) => a.clinicaId === clinicaId);
    if (procedimento) lista = lista.filter((a) => a.procedimentoNome === procedimento);
    if (tipo) lista = lista.filter((a) => a.tipo === tipo);
    if (pago === "pagos") lista = lista.filter((a) => a.pago);
    if (pago === "pendentes") lista = lista.filter((a) => !a.pago);

    setNomes(Object.fromEntries(getPacientes().map((p) => [p.id, p.nome])));
    setResultado(ordenarCronologico(lista));
  }

  async function exportar(formato: "pdf" | "xlsx") {
    if (!resultado || resultado.length === 0) return;
    setExportando(formato);
    try {
      if (formato === "pdf") await exportarPDF(resultado);
      else await exportarExcel(resultado);
    } finally {
      setExportando(null);
    }
  }

  const resumo = resultado ? resumoPorProcedimento(resultado) : [];

  return (
    <div>
      <PageHeader title="Relatórios" backHref="/configuracoes" />

      <div className="mb-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rel-de" className="field-label">
              De
            </label>
            <input id="rel-de" type="date" className="field-input" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div>
            <label htmlFor="rel-ate" className="field-label">
              Até
            </label>
            <input id="rel-ate" type="date" className="field-input" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
        </div>

        <div>
          <label htmlFor="rel-proc" className="field-label">
            Procedimento
          </label>
          <select id="rel-proc" className="field-input" value={procedimento} onChange={(e) => setProcedimento(e.target.value)}>
            <option value="">Todos</option>
            {nomesProc.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rel-clinica" className="field-label">
            Clínica
          </label>
          <select id="rel-clinica" className="field-input" value={clinicaId} onChange={(e) => setClinicaId(e.target.value)}>
            <option value="">Todas</option>
            {clinicas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rel-tipo" className="field-label">
              Tipo
            </label>
            <select id="rel-tipo" className="field-input" value={tipo} onChange={(e) => setTipo(e.target.value as "" | TipoAtendimento)}>
              <option value="">Todos</option>
              {(Object.keys(ROTULO_TIPO) as TipoAtendimento[]).map((t) => (
                <option key={t} value={t}>
                  {ROTULO_TIPO[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rel-pago" className="field-label">
              Pagamento
            </label>
            <select id="rel-pago" className="field-input" value={pago} onChange={(e) => setPago(e.target.value as FiltroPago)}>
              <option value="todos">Todos</option>
              <option value="pagos">Pagos</option>
              <option value="pendentes">Não pagos</option>
            </select>
          </div>
        </div>

        <button onClick={visualizar} className="primary-btn">
          Visualizar
        </button>
      </div>

      {resultado !== null &&
        (resultado.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted">Nada encontrado para esse filtro.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {resultado.length} {resultado.length === 1 ? "registro" : "registros"}
            </p>

            <div className="mb-5 flex gap-3">
              <button className="ghost-btn flex-1" onClick={() => exportar("pdf")} disabled={exportando !== null}>
                {exportando === "pdf" ? "Gerando..." : "Exportar PDF"}
              </button>
              <button className="ghost-btn flex-1" onClick={() => exportar("xlsx")} disabled={exportando !== null}>
                {exportando === "xlsx" ? "Gerando..." : "Exportar Excel"}
              </button>
            </div>

            {resumo.length > 1 && (
              <ul className="mb-5 flex flex-wrap gap-2">
                {resumo.map((r) => (
                  <li key={r.procedimento} className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                    {r.procedimento} <span className="font-semibold text-ink">{r.quantidade}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className="flex flex-col gap-2.5">
              {resultado.map((a) => {
                const clinica = clinicas.find((c) => c.id === a.clinicaId);
                return (
                  <li
                    key={a.id}
                    className={`list-card flex items-start justify-between gap-3 border-l-[6px] ${clinica ? "" : "border-l-line"}`}
                    style={clinica ? { borderLeftColor: clinica.cor } : undefined}
                  >
                    <div className="min-w-0">
                      <p className="font-bold">{nomes[a.pacienteId] ?? "Paciente removido"}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {a.procedimentoNome ?? ROTULO_TIPO[a.tipo]}
                        {descreverLocal(a) ? ` · ${descreverLocal(a)}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatarDataBR(a.data)} · {a.hora}
                        {a.tipo !== "atendimento" ? ` · ${ROTULO_TIPO[a.tipo]}` : ""}
                        {clinica ? ` · ${clinica.nome}` : ""}
                      </p>
                    </div>
                    {a.pago && <span className="shrink-0 rounded-full bg-paid px-2 py-0.5 text-xs font-semibold text-paid-ink">$ pago</span>}
                  </li>
                );
              })}
            </ul>
          </>
        ))}
    </div>
  );
}
