"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getLancamentos } from "@/lib/storage";
import { LancamentoFinanceiro } from "@/lib/types";
import { formatarReais } from "@/lib/moeda";
import { exportarFinanceiroPDF } from "@/lib/export";

export default function RelatorioFinanceiroPage() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [resultado, setResultado] = useState<LancamentoFinanceiro[] | null>(null);
  const [exportando, setExportando] = useState(false);

  function visualizar() {
    let lista = getLancamentos();
    if (de) lista = lista.filter((l) => l.data >= de);
    if (ate) lista = lista.filter((l) => l.data <= ate);
    setResultado(lista);
  }

  async function handleExportar() {
    if (!resultado || resultado.length === 0) return;
    setExportando(true);
    try {
      await exportarFinanceiroPDF(resultado);
    } finally {
      setExportando(false);
    }
  }

  const totalComissao = resultado?.reduce((soma, l) => soma + l.comissao, 0) ?? 0;

  return (
    <div>
      <PageHeader title="Relatório financeiro" backHref="/configuracoes/financeiro" />

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

        <button onClick={visualizar} className="primary-btn">
          Visualizar
        </button>
      </div>

      {resultado !== null && (
        <>
          {resultado.length === 0 ? (
            <p className="text-sm text-muted text-center mt-6">
              Nenhum lançamento encontrado para esse período.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">
                  Total de comissão: <span className="font-medium text-ink">{formatarReais(totalComissao)}</span>
                </p>
                <button
                  onClick={handleExportar}
                  disabled={exportando}
                  className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {exportando ? "Gerando..." : "Exportar PDF"}
                </button>
              </div>

              <ul className="flex flex-col gap-2.5">
                {resultado.map((l) => (
                  <li key={l.id} className="list-card">
                    <p className="font-medium">{l.pacienteNome}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatarDataBR(l.data)} · {formatarReais(l.valorTotal)} · {l.percentual}%
                    </p>
                    <p className="text-sm text-mint-ink mt-1">{formatarReais(l.comissao)}</p>
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

function formatarDataBR(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}
