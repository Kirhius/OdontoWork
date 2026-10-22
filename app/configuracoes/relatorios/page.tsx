"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getClinicas, getPatient, getProcedimentos } from "@/lib/storage";
import { descreverLocal } from "@/lib/local";
import { formatarDataBR } from "@/lib/data";
import { Clinica, Procedimento } from "@/lib/types";
import { exportarExcel, exportarPDF } from "@/lib/export";

export default function RelatoriosPage() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [resultado, setResultado] = useState<Procedimento[] | null>(null);
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
    setResultado(lista);
  }

  async function handleExport(formato: "pdf" | "xlsx") {
    if (!resultado || resultado.length === 0) return;
    setExportando(formato);
    try {
      if (formato === "pdf") await exportarPDF(resultado);
      else await exportarExcel(resultado);
    } finally {
      setExportando(null);
    }
  }

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
                {resultado.map((p) => (
                  <li key={p.id} className="list-card">
                    <p className="font-medium">{p.nome}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {getPatient(p.patientId)?.nome ?? "Paciente removido"} · {formatarDataBR(p.data)} ·{" "}
                      {descreverLocal(p.local)}
                      {p.clinicaNome ? ` · ${p.clinicaNome}` : ""}
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
