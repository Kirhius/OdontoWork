"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import {
  addProcedimentoCadastro,
  deleteProcedimentoCadastro,
  getProcedimentosCadastro,
  normalizarNome,
  updateProcedimentoCadastro,
} from "@/lib/storage";
import { OPCOES_TIPO_LOCAL } from "@/lib/local";
import { ProcedimentoCadastro, TipoLocal } from "@/lib/types";

const ROTULO_LOCAL: Record<TipoLocal, string> = {
  dente: "Dente (escolho o número ao lançar)",
  arcada_superior: "Arcada superior",
  arcada_inferior: "Arcada inferior",
  boca_toda: "Boca toda",
};

const ROTULO_CURTO: Record<TipoLocal, string> = {
  dente: "Dente",
  arcada_superior: "Arcada superior",
  arcada_inferior: "Arcada inferior",
  boca_toda: "Boca toda",
};

export default function ProcedimentosPage() {
  const [lista, setLista] = useState<ProcedimentoCadastro[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [tipoLocal, setTipoLocal] = useState<TipoLocal>("dente");
  const [aviso, setAviso] = useState("");

  function carregar() {
    setLista(getProcedimentosCadastro());
  }

  useEffect(carregar, []);

  function limpar() {
    setNome("");
    setTipoLocal("dente");
    setEditandoId(null);
    setAviso("");
  }

  function salvar() {
    if (!nome.trim()) return;
    const repetido = lista.some(
      (p) => p.id !== editandoId && normalizarNome(p.nome) === normalizarNome(nome) && p.tipoLocal === tipoLocal
    );
    if (repetido) {
      setAviso("Esse procedimento já existe com esse local.");
      return;
    }
    if (editandoId) updateProcedimentoCadastro(editandoId, { nome, tipoLocal });
    else addProcedimentoCadastro(nome, tipoLocal);
    limpar();
    carregar();
  }

  function editar(p: ProcedimentoCadastro) {
    setEditandoId(p.id);
    setNome(p.nome);
    setTipoLocal(p.tipoLocal);
    setAviso("");
  }

  return (
    <div>
      <PageHeader title="Procedimentos" backHref="/configuracoes" />
      <p className="mb-5 text-sm text-muted">
        Estes são os procedimentos que aparecem para escolher ao lançar um atendimento. Se o mesmo
        procedimento é feito em locais diferentes (dente e arcada, por exemplo), cadastre um para cada.
      </p>

      <div className="mb-6 flex flex-col gap-4">
        <div>
          <label htmlFor="proc-nome" className="field-label">
            Nome
          </label>
          <input
            id="proc-nome"
            className="field-input"
            placeholder="Ex.: Restauração"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setAviso("");
            }}
          />
        </div>
        <div>
          <label htmlFor="proc-local" className="field-label">
            Aplicado em
          </label>
          <select
            id="proc-local"
            className="field-input"
            value={tipoLocal}
            onChange={(e) => {
              setTipoLocal(e.target.value as TipoLocal);
              setAviso("");
            }}
          >
            {OPCOES_TIPO_LOCAL.map((t) => (
              <option key={t} value={t}>
                {ROTULO_LOCAL[t]}
              </option>
            ))}
          </select>
        </div>

        {aviso && <p className="text-xs text-danger-ink">{aviso}</p>}

        <div className="flex gap-3">
          <button onClick={salvar} className="primary-btn" disabled={!nome.trim()}>
            {editandoId ? "Salvar alteração" : "Adicionar"}
          </button>
          {editandoId && (
            <button onClick={limpar} className="rounded-xl border border-line px-4 text-sm text-muted">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted">Nenhum procedimento cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((p) => (
            <li key={p.id} className="list-card flex items-center justify-between gap-3">
              <button onClick={() => editar(p)} className="min-w-0 flex-1 text-left">
                <p className="font-medium">{p.nome}</p>
                <p className="mt-0.5 text-xs text-muted">{ROTULO_CURTO[p.tipoLocal]}</p>
              </button>
              <DeleteButton
                onConfirm={() => {
                  deleteProcedimentoCadastro(p.id);
                  if (editandoId === p.id) limpar();
                  carregar();
                }}
              />
            </li>
          ))}
        </ul>
      )}
      {lista.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          Excluir um procedimento daqui não altera os atendimentos que já foram lançados com ele.
        </p>
      )}
    </div>
  );
}
