"use client";

import { Clinica } from "@/lib/types";

export const ABA_TODAS = "todas";
export const ABA_SEM_CLINICA = "sem";

// true quando o lançamento pertence à aba escolhida.
export function casaComAba(aba: string, clinicaId: string | undefined): boolean {
  if (aba === ABA_TODAS) return true;
  if (aba === ABA_SEM_CLINICA) return !clinicaId;
  return clinicaId === aba;
}

interface Props {
  clinicas: Clinica[];
  valor: string;
  onChange: (aba: string) => void;
  mostrarSemClinica?: boolean; // mostra a aba "Sem clínica" (quando existe algo sem clínica)
}

// Abas para ver tudo ou uma clínica de cada vez. Rolam para o lado se forem muitas.
export default function AbasClinica({ clinicas, valor, onChange, mostrarSemClinica }: Props) {
  const abas = [
    { id: ABA_TODAS, nome: "Todas", cor: "" },
    ...clinicas.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor })),
    ...(mostrarSemClinica ? [{ id: ABA_SEM_CLINICA, nome: "Sem clínica", cor: "" }] : []),
  ];

  return (
    <div
      className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1"
      role="tablist"
      aria-label="Clínica"
    >
      {abas.map((a) => (
        <button
          key={a.id}
          type="button"
          role="tab"
          aria-selected={valor === a.id}
          onClick={() => onChange(a.id)}
          className="chip flex shrink-0 items-center gap-2 whitespace-nowrap"
        >
          {a.cor && (
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.cor }} aria-hidden="true" />
          )}
          {a.nome}
        </button>
      ))}
    </div>
  );
}
