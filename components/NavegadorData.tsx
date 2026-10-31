"use client";

import {
  fimMes,
  fimSemana,
  hojeISO,
  inicioMes,
  inicioSemana,
  rotuloDia,
  rotuloMes,
  rotuloSemana,
  somarDias,
  somarMeses,
  dataValida,
} from "@/lib/data";

export type ModoPeriodo = "dia" | "semana" | "mes";

export function intervaloDoPeriodo(data: string, modo: ModoPeriodo): { de: string; ate: string } {
  if (modo === "dia") return { de: data, ate: data };
  if (modo === "semana") return { de: inicioSemana(data), ate: fimSemana(data) };
  return { de: inicioMes(data), ate: fimMes(data) };
}

interface Props {
  data: string;
  modo: ModoPeriodo;
  onChange: (novaData: string) => void;
}

function Seta({ direcao }: { direcao: "anterior" | "proximo" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direcao === "anterior" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NavegadorData({ data, modo, onChange }: Props) {
  const { de, ate } = intervaloDoPeriodo(data, modo);
  const hoje = hojeISO();
  const incluiHoje = hoje >= de && hoje <= ate;

  function mover(sentido: -1 | 1) {
    if (modo === "dia") onChange(somarDias(data, sentido));
    else if (modo === "semana") onChange(somarDias(data, 7 * sentido));
    else onChange(somarMeses(data, sentido));
  }

  const botao =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink";

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => mover(-1)} className={botao} aria-label="Anterior">
          <Seta direcao="anterior" />
        </button>

        {modo === "dia" ? (
          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-lg leading-tight text-ink">{rotuloDia(data)}</p>
            <input
              type="date"
              aria-label="Escolher data"
              className="mx-auto mt-0.5 block w-full max-w-[11rem] bg-transparent text-center text-xs text-muted outline-none"
              value={data}
              onChange={(e) => dataValida(e.target.value) && onChange(e.target.value)}
            />
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-center font-display text-lg leading-tight text-ink">
            {modo === "semana" ? rotuloSemana(data) : rotuloMes(data)}
          </p>
        )}

        <button type="button" onClick={() => mover(1)} className={botao} aria-label="Próximo">
          <Seta direcao="proximo" />
        </button>
      </div>

      {!incluiHoje && (
        <button
          type="button"
          onClick={() => onChange(hoje)}
          className="mx-auto mt-2 block text-sm text-muted underline underline-offset-2"
        >
          Ir para hoje
        </button>
      )}
    </div>
  );
}
