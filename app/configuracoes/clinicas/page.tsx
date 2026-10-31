"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import {
  addClinica,
  deleteClinica,
  getAtendimentos,
  getClinicas,
  normalizarNome,
  updateClinica,
} from "@/lib/storage";
import { Clinica } from "@/lib/types";

const PALETA = ["#E57373", "#F2A65A", "#E8C547", "#6FBF8E", "#4DB6AC", "#64A5E8", "#9B8AE0", "#D985C0"];

export default function ClinicasPage() {
  const [lista, setLista] = useState<Clinica[]>([]);
  const [usos, setUsos] = useState<Record<string, number>>({});
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(PALETA[3]);
  const [aviso, setAviso] = useState("");

  function carregar() {
    setLista(getClinicas());
    const contagem: Record<string, number> = {};
    for (const a of getAtendimentos()) {
      if (a.clinicaId) contagem[a.clinicaId] = (contagem[a.clinicaId] ?? 0) + 1;
    }
    setUsos(contagem);
  }

  useEffect(carregar, []);

  function limpar() {
    setNome("");
    setEditandoId(null);
    setAviso("");
  }

  function salvar() {
    if (!nome.trim()) return;
    if (lista.some((c) => c.id !== editandoId && normalizarNome(c.nome) === normalizarNome(nome))) {
      setAviso("Já existe uma clínica com esse nome.");
      return;
    }
    if (editandoId) updateClinica(editandoId, { nome, cor });
    else addClinica(nome, cor);
    limpar();
    carregar();
  }

  function editar(c: Clinica) {
    setEditandoId(c.id);
    setNome(c.nome);
    setCor(c.cor);
    setAviso("");
  }

  return (
    <div>
      <PageHeader title="Clínicas" backHref="/configuracoes" />
      <p className="mb-5 text-sm text-muted">
        A cor aparece na borda de cada atendimento, para você reconhecer a clínica de relance.
      </p>

      <div className="mb-6 flex flex-col gap-4">
        <div>
          <label htmlFor="clinica-nome" className="field-label">
            Nome da clínica
          </label>
          <input
            id="clinica-nome"
            className="field-input"
            placeholder="Ex.: Ulisses Odontologia"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setAviso("");
            }}
          />
        </div>

        <div>
          <span className="field-label">Cor</span>
          <div className="flex flex-wrap items-center gap-2.5">
            {PALETA.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                aria-pressed={cor.toLowerCase() === c.toLowerCase()}
                onClick={() => setCor(c)}
                className={`h-9 w-9 rounded-full border-2 transition-transform ${
                  cor.toLowerCase() === c.toLowerCase() ? "scale-110 border-ink" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs text-muted">
              Outra
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                aria-label="Escolher outra cor"
              />
            </label>
          </div>
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
        <p className="mt-6 text-center text-sm text-muted">Nenhuma clínica cadastrada.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((c) => (
            <li
              key={c.id}
              className="list-card flex items-center justify-between gap-3 border-l-[6px]"
              style={{ borderLeftColor: c.cor }}
            >
              <button onClick={() => editar(c)} className="min-w-0 flex-1 text-left">
                <p className="font-medium">{c.nome}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {usos[c.id] ?? 0} {(usos[c.id] ?? 0) === 1 ? "lançamento" : "lançamentos"}
                </p>
              </button>
              <DeleteButton
                onConfirm={() => {
                  deleteClinica(c.id);
                  if (editandoId === c.id) limpar();
                  carregar();
                }}
              />
            </li>
          ))}
        </ul>
      )}
      {lista.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          Ao excluir uma clínica, os lançamentos dela continuam salvos, só ficam sem clínica.
        </p>
      )}
    </div>
  );
}
