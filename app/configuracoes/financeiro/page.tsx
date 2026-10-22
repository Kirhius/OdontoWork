"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import ArchiveButton from "@/components/ArchiveButton";
import {
  addLancamento,
  deleteLancamento,
  getLancamentos,
  setLancamentoArquivado,
  updateLancamento,
} from "@/lib/storage";
import { LancamentoFinanceiro } from "@/lib/types";
import { formatarReais } from "@/lib/moeda";
import { formatarDataBR, hojeISO } from "@/lib/data";

function paraNumero(texto: string): number {
  const n = Number(texto.replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
}

export default function FinanceiroPage() {
  const [lista, setLista] = useState<LancamentoFinanceiro[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [pacienteNome, setPacienteNome] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [percentual, setPercentual] = useState("");
  const [data, setData] = useState("");

  function carregar() {
    setLista(getLancamentos());
  }

  useEffect(() => {
    carregar();
    setData(hojeISO());
  }, []);

  const valorNum = paraNumero(valorTotal);
  const percentualNum = paraNumero(percentual);
  const comissao = valorNum * (percentualNum / 100);

  const arquivados = lista.filter((l) => l.arquivado);
  const ativos = lista.filter((l) => !l.arquivado);

  function limparForm() {
    setPacienteNome("");
    setValorTotal("");
    setPercentual("");
    setData(hojeISO());
    setEditandoId(null);
  }

  function handleSalvar() {
    if (!pacienteNome.trim() || valorNum <= 0 || percentualNum <= 0) return;

    const dados = {
      pacienteNome: pacienteNome.trim(),
      valorTotal: valorNum,
      percentual: percentualNum,
      comissao,
      data,
    };

    if (editandoId) {
      updateLancamento(editandoId, dados);
    } else {
      addLancamento(dados);
    }
    limparForm();
    carregar();
  }

  function handleEditar(l: LancamentoFinanceiro) {
    setEditandoId(l.id);
    setPacienteNome(l.pacienteNome);
    setValorTotal(String(l.valorTotal));
    setPercentual(String(l.percentual));
    setData(l.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderItem(l: LancamentoFinanceiro) {
    return (
      <li
        key={l.id}
        className={`rounded-xl border px-4 py-3.5 flex items-start justify-between gap-3 ${
          l.arquivado ? "border-line bg-bg" : "border-line bg-surface"
        }`}
      >
        <button onClick={() => handleEditar(l)} className="text-left flex-1 min-w-0">
          <p className="font-medium">{l.pacienteNome}</p>
          <p className="text-xs text-muted mt-0.5">
            {formatarDataBR(l.data)} · {formatarReais(l.valorTotal)} · {l.percentual}%
          </p>
          <p className="text-sm text-mint-ink mt-1">{formatarReais(l.comissao)}</p>
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <ArchiveButton
            arquivado={!!l.arquivado}
            onClick={() => {
              setLancamentoArquivado(l.id, !l.arquivado);
              carregar();
            }}
          />
          <DeleteButton
            onConfirm={() => {
              deleteLancamento(l.id);
              if (editandoId === l.id) limparForm();
              carregar();
            }}
          />
        </div>
      </li>
    );
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        backHref="/configuracoes"
        action={
          <Link
            href="/configuracoes/financeiro/relatorio"
            className="text-sm font-medium rounded-lg border border-line bg-surface px-3.5 py-2 shrink-0"
          >
            Relatório
          </Link>
        }
      />

      <div className="flex flex-col gap-4 mb-7">
        <div>
          <label className="field-label">Paciente</label>
          <input
            className="field-input"
            placeholder="Nome do paciente (não precisa estar cadastrado)"
            value={pacienteNome}
            onChange={(e) => setPacienteNome(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Valor total (R$)</label>
            <input
              className="field-input"
              inputMode="decimal"
              placeholder="Ex.: 800,00"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Porcentagem (%)</label>
            <input
              className="field-input"
              inputMode="decimal"
              placeholder="Ex.: 2,5"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Data</label>
          <input
            type="date"
            className="field-input"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        {valorNum > 0 && percentualNum > 0 && (
          <p className="text-sm text-mint-ink bg-mint/30 rounded-lg px-3 py-2">
            Comissão: {formatarReais(comissao)}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSalvar}
            className="primary-btn"
            disabled={!pacienteNome.trim() || valorNum <= 0 || percentualNum <= 0}
          >
            {editandoId ? "Salvar alteração" : "Salvar"}
          </button>
          {editandoId && (
            <button
              onClick={limparForm}
              className="rounded-xl border border-line px-4 text-sm text-muted"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {arquivados.length > 0 && (
        <section className="mb-7">
          <h2 className="text-sm font-medium text-muted mb-2.5">
            Arquivados ({arquivados.length})
          </h2>
          <ul className="flex flex-col gap-2.5">{arquivados.map(renderItem)}</ul>
        </section>
      )}

      <section>
        {lista.length > 0 && (
          <h2 className="text-sm font-medium text-muted mb-2.5">Lançamentos</h2>
        )}
        {ativos.length === 0 ? (
          <p className="text-sm text-muted text-center mt-6">
            {lista.length === 0 ? "Nenhum lançamento ainda." : "Nenhum lançamento ativo."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">{ativos.map(renderItem)}</ul>
        )}
      </section>
    </div>
  );
}
