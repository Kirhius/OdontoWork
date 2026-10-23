"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import {
  addPreco,
  copiarPrecos,
  deletePreco,
  getClinicas,
  getPrecos,
  updatePreco,
} from "@/lib/storage";
import { Clinica, PrecoProcedimento, TipoLocal } from "@/lib/types";
import { descreverTipoLocal } from "@/lib/local";
import { formatarReais } from "@/lib/moeda";

const OPCOES_TIPO_LOCAL: TipoLocal[] = [
  "dente",
  "arcada_superior",
  "arcada_inferior",
  "boca_toda",
];

// "" = procedimentos lançados sem clínica (inclui os valores cadastrados antes da tabela por clínica).
const SEM_CLINICA = "";

export default function ProcedimentosPage() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [todos, setTodos] = useState<PrecoProcedimento[]>([]);
  const [clinicaId, setClinicaId] = useState(SEM_CLINICA);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [tipoLocal, setTipoLocal] = useState<TipoLocal>("dente");
  const [valor, setValor] = useState("");
  const [aviso, setAviso] = useState("");
  const [origemEscolhida, setOrigemEscolhida] = useState("");
  const [mensagemCopia, setMensagemCopia] = useState("");

  function carregar() {
    setTodos(getPrecos());
  }

  useEffect(() => {
    const lista = getClinicas();
    setClinicas(lista);
    carregar();
    // Abre já na primeira clínica cadastrada.
    setClinicaId(lista[0]?.id ?? SEM_CLINICA);
  }, []);

  const opcoes = [...clinicas.map((c) => ({ id: c.id, nome: c.nome })), { id: SEM_CLINICA, nome: "Sem clínica" }];
  const atual = opcoes.find((o) => o.id === clinicaId) ?? opcoes[opcoes.length - 1];
  const lista = todos.filter((p) => (p.clinicaId ?? "") === clinicaId);
  const sugestoes = Array.from(new Set(todos.map((p) => p.nome)));

  // Tabelas de outras clínicas que já têm valores e podem ser copiadas para esta.
  const origens = opcoes.filter(
    (o) => o.id !== clinicaId && todos.some((p) => (p.clinicaId ?? "") === o.id)
  );
  const origem = origens.some((o) => o.id === origemEscolhida) ? origemEscolhida : origens[0]?.id ?? "";

  function limparForm() {
    setNome("");
    setTipoLocal("dente");
    setValor("");
    setAviso("");
    setEditandoId(null);
  }

  function escolherClinica(id: string) {
    setClinicaId(id);
    setMensagemCopia("");
    limparForm();
  }

  function handleSalvar() {
    const numerico = Number(valor.replace(",", "."));
    if (!nome.trim() || Number.isNaN(numerico) || numerico <= 0) return;

    const duplicado = lista.some(
      (p) =>
        p.id !== editandoId &&
        p.nome.trim().toLowerCase() === nome.trim().toLowerCase() &&
        p.tipoLocal === tipoLocal
    );
    if (duplicado) {
      setAviso("Esse procedimento já está cadastrado com esse local nesta clínica. Toque nele na lista para editar o valor.");
      return;
    }

    if (editandoId) {
      updatePreco(editandoId, { nome, tipoLocal, valor: numerico });
    } else {
      addPreco(nome, tipoLocal, numerico, clinicaId || undefined);
    }
    limparForm();
    carregar();
  }

  function handleEditar(p: PrecoProcedimento) {
    setEditandoId(p.id);
    setNome(p.nome);
    setTipoLocal(p.tipoLocal);
    setValor(String(p.valor).replace(".", ","));
    setAviso("");
  }

  function handleCopiar() {
    const copiados = copiarPrecos(origem, clinicaId);
    carregar();
    setMensagemCopia(
      copiados === 1 ? "1 valor copiado." : `${copiados} valores copiados.`
    );
  }

  return (
    <div>
      <PageHeader title="Procedimentos" backHref="/configuracoes" />
      <p className="text-sm text-muted mb-5">
        Cada clínica tem a sua tabela de valores. Eles não aparecem no cadastro do paciente: só
        entram nos relatórios, pela clínica em que o procedimento foi feito.
      </p>

      {clinicas.length === 0 && (
        <p className="text-xs text-muted mb-4">
          Nenhuma clínica cadastrada.{" "}
          <Link href="/configuracoes/adicionais/clinicas" className="underline underline-offset-2">
            Cadastrar clínicas
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Clínica">
        {opcoes.map((o) => {
          const ativa = o.id === clinicaId;
          return (
            <button
              key={o.id || "sem-clinica"}
              role="tab"
              aria-selected={ativa}
              onClick={() => escolherClinica(o.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                ativa
                  ? "bg-mint text-mint-ink border-mint"
                  : "bg-surface text-muted border-line"
              }`}
            >
              {o.nome}
            </button>
          );
        })}
      </div>

      <h2 className="font-display text-lg mb-3">{atual.nome}</h2>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="field-label">Procedimento</label>
          <input
            className="field-input"
            placeholder="Ex.: Restauração, Limpeza..."
            list="procedimentos-ja-cadastrados"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setAviso("");
            }}
          />
          <datalist id="procedimentos-ja-cadastrados">
            {sugestoes.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Local</label>
            <select
              className="field-input"
              value={tipoLocal}
              onChange={(e) => {
                setTipoLocal(e.target.value as TipoLocal);
                setAviso("");
              }}
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

        {aviso && <p className="text-xs text-coral-ink">{aviso}</p>}

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

      {lista.length === 0 && origens.length > 0 && (
        <div className="rounded-xl border border-dashed border-line px-4 py-4 mb-6">
          <p className="text-sm text-muted mb-3">
            Esta tabela está vazia. Você pode começar copiando os valores de outra e depois ajustar
            o que for diferente.
          </p>
          <div className="flex gap-3">
            <select
              className="field-input"
              value={origem}
              onChange={(e) => setOrigemEscolhida(e.target.value)}
              aria-label="Copiar valores de"
            >
              {origens.map((o) => (
                <option key={o.id || "sem-clinica"} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
            <button
              onClick={handleCopiar}
              className="rounded-xl border border-line bg-surface px-4 text-sm font-medium shrink-0"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {mensagemCopia && (
        <p className="text-sm text-mint-ink bg-mint/40 rounded-lg px-3 py-2 text-center mb-4">
          {mensagemCopia}
        </p>
      )}

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-6">
          Nenhum procedimento cadastrado em {atual.nome}.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((p) => (
            <li key={p.id} className="list-card flex items-start justify-between gap-3">
              <button onClick={() => handleEditar(p)} className="text-left flex-1 min-w-0">
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
