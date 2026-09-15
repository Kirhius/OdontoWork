"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import { addPreco, deletePreco, getPrecos, updatePreco } from "@/lib/storage";
import { PrecoProcedimento, TipoLocal } from "@/lib/types";
import { descreverTipoLocal } from "@/lib/local";
import { formatarReais } from "@/lib/moeda";

const OPCOES_TIPO_LOCAL: TipoLocal[] = [
  "dente",
  "arcada_superior",
  "arcada_inferior",
  "boca_toda",
];

export default function ProcedimentosPage() {
  const [lista, setLista] = useState<PrecoProcedimento[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [tipoLocal, setTipoLocal] = useState<TipoLocal>("dente");
  const [valor, setValor] = useState("");

  function carregar() {
    setLista(getPrecos());
  }

  useEffect(carregar, []);

  function limparForm() {
    setNome("");
    setTipoLocal("dente");
    setValor("");
    setEditandoId(null);
  }

  function handleSalvar() {
    const numerico = Number(valor.replace(",", "."));
    if (!nome.trim() || Number.isNaN(numerico) || numerico <= 0) return;

    if (editandoId) {
      updatePreco(editandoId, { nome, tipoLocal, valor: numerico });
    } else {
      addPreco(nome, tipoLocal, numerico);
    }
    limparForm();
    carregar();
  }

  function handleEditar(p: PrecoProcedimento) {
    setEditandoId(p.id);
    setNome(p.nome);
    setTipoLocal(p.tipoLocal);
    setValor(String(p.valor));
  }

  return (
    <div>
      <PageHeader title="Procedimentos" backHref="/configuracoes" />
      <p className="text-sm text-muted mb-5">
        Cadastre o valor de cada procedimento. Esses valores não aparecem no
        cadastro do paciente — eles só entram no cálculo dos relatórios.
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="field-label">Procedimento</label>
          <input
            className="field-input"
            placeholder="Ex.: Restauração, Limpeza..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Local</label>
            <select
              className="field-input"
              value={tipoLocal}
              onChange={(e) => setTipoLocal(e.target.value as TipoLocal)}
            >
              {OPCOES_TIPO_LOCAL.map((t) => (
                <option key={t} value={t}>
                  {descreverTipoLocal(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Valor (R$)</label>
            <input
              className="field-input"
              inputMode="decimal"
              placeholder="Ex.: 150,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSalvar}
            className="primary-btn"
            disabled={!nome.trim() || !valor.trim()}
          >
            {editandoId ? "Salvar alteração" : "Adicionar"}
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

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-6">
          Nenhum procedimento cadastrado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((p) => (
            <li key={p.id} className="list-card flex items-start justify-between gap-3">
              <button onClick={() => handleEditar(p)} className="text-left flex-1">
                <p className="font-medium">{p.nome}</p>
                <p className="text-xs text-muted mt-0.5">
                  {descreverTipoLocal(p.tipoLocal)} · {formatarReais(p.valor)}
                </p>
              </button>
              <DeleteButton
                onConfirm={() => {
                  deletePreco(p.id);
                  if (editandoId === p.id) limparForm();
                  carregar();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
