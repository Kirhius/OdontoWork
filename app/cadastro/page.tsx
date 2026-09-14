"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { addPatient } from "@/lib/storage";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [salvo, setSalvo] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    addPatient(nome);
    setSalvo(true);
    setNome("");
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <div>
      <PageHeader title="Cadastro" backHref="/" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="nome" className="field-label">
            Nome do paciente
          </label>
          <input
            id="nome"
            className="field-input"
            placeholder="Ex.: Maria da Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
        </div>

        <button type="submit" className="primary-btn" disabled={!nome.trim()}>
          Cadastrar
        </button>

        {salvo && (
          <p className="text-sm text-mint-ink bg-mint/40 rounded-lg px-3 py-2 text-center">
            Paciente cadastrado.
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push("/pacientes")}
          className="text-sm text-muted underline underline-offset-2 text-center"
        >
          Ver pacientes cadastrados
        </button>
      </form>
    </div>
  );
}
