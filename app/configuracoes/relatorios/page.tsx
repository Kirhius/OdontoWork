"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getClinicas, getPatient, getProcedimentos, getValorProcedimento } from "@/lib/storage";
import { descreverLocal } from "@/lib/local";
import { formatarDataBR } from "@/lib/data";
import { formatarReais } from "@/lib/moeda";
import { Clinica, Procedimento } from "@/lib/types";
import { exportarExcel, exportarPDF } from "@/lib/export";

interface LinhaResultado {
  proc: Procedimento;
  paciente: string;
  valor: number | undefined;
}

export default function RelatoriosPage() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [pago, setPago] = useState(false);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [resultado, setResultado] = useState<LinhaResultado[] | null>(null);
  const [exportando, setExportando] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    setClinicas(getClinicas());
  }, []);

  function visualizar() {
    let lista = getProcedimentos();
    if (de) lista = lista.filter((p) => p.data >= de);
    if (ate) lista = lista.filter((p) => p.data <= ate);
    if (clinicaId) lista = lista.filter((p) => p.clinicaId === clinicaId);
    if (procedimento.trim()) {
      const termo = procedimento.trim().toLowerCase();
      lista = lista.filter((p) => p.nome.toLowerCase().includes(termo));
    }
    // Desmarcado: só os pendentes. Marcado: só os já pagos.
    lista = lista.filter((p) => !!p.pago === pago);

    setResultado(
      lista.map((proc) => ({
        proc,
        paciente: getPatient(proc.patientId)?.nome ?? "Paciente removido",
        valor: getValorProcedimento(proc),
      }))
    );
  }

  async function handleExport(formato: "pdf" | "xlsx") {
    if (!resultado || resultado.length === 0) return;
    setExportando(formato);
    try {
      const procs = resultado.map((r) => r.proc);
      if (formato === "pdf") await exportarPDF(procs);
      else await exportarExcel(procs);
    } finally {
      setExportando(null);
    }
  }

  const total = resultado?.reduce((soma, r) => soma + (r.valor ?? 0), 0) ?? 0;
  const semValor = resultado?.filter((r) => r.valor === undefined).length ?? 0;

  return (
    <div>
      <PageHeader title="Relatórios" backHref="/configuracoes" />

      <div className="flex flex-col gap-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">De</label>
            <input type="date" className="field-input" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Até</label>
            <input type="date" className="field-input" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
        </div>

        {clinicas.length > 0 && (
          <div>
            <label className="field-label">Clínica (opcional)</label>
            <select
              className="field-input"
              value={clinicaId}
              onChange={(e) => setClinicaId(e.target.value)}
            >
              <option value="">Todas as clínicas</option>
              {clinicas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="field-label">Procedimento (opcional)</label>
          <input
            className="field-input"
            placeholder="Ex.: Restauração"
            value={procedimento}
            onChange={(e) => setProcedimento(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={pago}
            onChange={(e) => setPago(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium">Pago</span>
            <span className="block text-xs text-muted">
              Desmarcado mostra só os pendentes. Marcado mostra só os já pagos.
            </span>
          </span>
        </label>

        <button onClick={visualizar} className="primary-btn">
          Visualizar
        </button>
      </div>

      {resultado !== null && (
        <>
          {resultado.length === 0 ? (
            <p className="text-sm text-muted text-center mt-6">
              Nenhum procedimento encontrado para esse filtro.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm text-muted">
                  {resultado.length} {resultado.length === 1 ? "procedimento" : "procedimentos"} ·
                  Total <span className="font-medium text-ink">{formatarReais(total)}</span>
                </p>
              </div>

              {semValor > 0 && (
                <p className="text-xs text-coral-ink bg-coral/20 rounded-lg px-3 py-2 mb-3">
                  {semValor} {semValor === 1 ? "procedimento está" : "procedimentos estão"} sem valor
                  cadastrado na tabela da clínica e não entram no total. Cadastre em Configurações &gt;
                  Procedimentos.
                </p>
              )}

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exportando !== null}
                  className="flex-1 rounded-xl border border-line bg-surface py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {exportando === "pdf" ? "Gerando..." : "Exportar PDF"}
                </button>
                <button
                  onClick={() => handleExport("xlsx")}
                  disabled={exportando !== null}
                  className="flex-1 rounded-xl border border-line bg-surface py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {exportando === "xlsx" ? "Gerando..." : "Exportar Excel"}
                </button>
              </div>

              <ul className="flex flex-col gap-2.5">
                {resultado.map(({ proc, paciente, valor }) => (
                  <li key={proc.id} className="list-card flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{proc.nome}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {paciente} · {formatarDataBR(proc.data)} · {descreverLocal(proc.local)}
                        {proc.clinicaNome ? ` · ${proc.clinicaNome}` : ""}
                      </p>
                    </div>
                    <p
                      className={`text-sm shrink-0 ${
                        valor === undefined ? "text-muted" : "text-mint-ink font-medium"
                      }`}
                    >
                      {valor === undefined ? "sem valor" : formatarReais(valor)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
