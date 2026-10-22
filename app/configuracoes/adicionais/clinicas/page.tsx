"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import { addClinica, deleteClinica, getClinicas } from "@/lib/storage";
import { Clinica } from "@/lib/types";

export default function ClinicasPage() {
  const [lista, setLista] = useState<Clinica[]>([]);
  const [nome, setNome] = useState("");
  const [aviso, setAviso] = useState("");

  function carregar() {
    setLista(getClinicas());
  }

  useEffect(carregar, []);

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    const limpo = nome.trim();
    if (!limpo) return;

    if (lista.some((c) => c.nome.trim().toLowerCase() === limpo.toLowerCase())) {
      setAviso("Essa clínica já está cadastrada.");
      return;
    }

    addClinica(limpo);
    setNome("");
    setAviso("");
    carregar();
  }

  return (
    <div>
      <PageHeader title="Clínicas" backHref="/configuracoes/adicionais" />

      <form onSubmit={handleAdicionar} className="flex flex-col gap-4 mb-6">
        <div>
          <label htmlFor="clinica" className="field-label">
            Nome da clínica
          </label>
          <input
            id="clinica"
            className="field-input"
            placeholder="Ex.: Clínica Sorriso"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setAviso("");
            }}
          />
          {aviso && <p className="text-xs text-coral-ink mt-1.5">{aviso}</p>}
        </div>

        <button type="submit" className="primary-btn" disabled={!nome.trim()}>
          Adicionar
        </button>
      </form>

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-6">
          Nenhuma clínica cadastrada ainda.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {lista.map((c) => (
              <li key={c.id} className="list-card flex items-center justify-between gap-3">
                <span className="font-medium">{c.nome}</span>
                <DeleteButton
                  onConfirm={() => {
                    deleteClinica(c.id);
                    carregar();
                  }}
                />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-4">
            Excluir uma clínica não apaga os procedimentos já lançados: eles
            continuam mostrando o nome dela.
          </p>
        </>
      )}
    </div>
  );
}
