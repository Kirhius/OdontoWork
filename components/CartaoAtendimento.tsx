"use client";

import Link from "next/link";
import { Atendimento, Clinica } from "@/lib/types";
import { subtituloAtendimento } from "@/lib/local";

interface Props {
  atendimento: Atendimento;
  nomePaciente: string;
  clinica?: Clinica;
  onTogglePago: () => void;
}

// Hora à esquerda, nome em negrito e procedimento menor embaixo.
// A borda esquerda leva a cor da clínica e o "$" no canto marca o pagamento.
export default function CartaoAtendimento({ atendimento: a, nomePaciente, clinica, onTogglePago }: Props) {
  return (
    <li className="relative">
      <Link
        href={`/atendimentos/${a.id}`}
        className={`flex items-start gap-3 rounded-xl border border-line border-l-[6px] bg-surface py-3.5 pl-3.5 pr-14 ${
          clinica ? "" : "border-l-line"
        }`}
        style={clinica ? { borderLeftColor: clinica.cor } : undefined}
      >
        <span className="w-12 shrink-0 pt-0.5 font-display text-sm tabular-nums text-muted">
          {a.hora}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold text-ink">{nomePaciente}</span>
          <span className="block truncate text-sm font-normal text-muted">
            {subtituloAtendimento(a)}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={onTogglePago}
        aria-pressed={a.pago}
        aria-label={a.pago ? "Pago pela clínica. Toque para desmarcar" : "Marcar como pago pela clínica"}
        title={a.pago ? "Pago" : "Marcar como pago"}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
          a.pago ? "border-paid bg-paid text-paid-ink" : "border-line bg-surface text-muted"
        }`}
      >
        $
      </button>
    </li>
  );
}
