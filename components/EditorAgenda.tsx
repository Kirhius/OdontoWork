"use client";

import { DiaAgenda, PeriodoAgenda } from "@/lib/types";
import { DIAS_SEMANA, HORARIOS_30, ROTULO_PERIODO } from "@/lib/agenda";

interface Props {
  value: DiaAgenda[];
  onChange: (agenda: DiaAgenda[]) => void;
}

const OPCOES: PeriodoAgenda[] = ["manha", "tarde", "dia", "horario"];

// Uma linha por dia da semana: "Não atendo", manhã, tarde, dia todo ou um horário.
export default function EditorAgenda({ value, onChange }: Props) {
  function trocar(dia: number, escolha: string) {
    const resto = value.filter((a) => a.dia !== dia);
    if (!escolha) return onChange(resto);
    const periodo = escolha as PeriodoAgenda;
    onChange([
      ...resto,
      periodo === "horario" ? { dia, periodo, inicio: "08:00", fim: "12:00" } : { dia, periodo },
    ]);
  }

  function ajustar(dia: number, campo: "inicio" | "fim", hora: string) {
    onChange(value.map((a) => (a.dia === dia ? { ...a, [campo]: hora } : a)));
  }

  return (
    <div className="flex flex-col gap-2">
      {DIAS_SEMANA.map(({ dia, curto, nome }) => {
        const atual = value.find((a) => a.dia === dia);
        return (
          <div key={dia} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-sm font-medium">{curto}</span>
            <select
              aria-label={`${nome}: período`}
              className="field-input !py-2 text-sm"
              value={atual?.periodo ?? ""}
              onChange={(e) => trocar(dia, e.target.value)}
            >
              <option value="">Não atendo</option>
              {OPCOES.map((p) => (
                <option key={p} value={p}>
                  {ROTULO_PERIODO[p]}
                </option>
              ))}
            </select>
            {atual?.periodo === "horario" && (
              <>
                <select
                  aria-label={`${nome}: início`}
                  className="field-input !w-auto !px-2 !py-2 text-sm"
                  value={atual.inicio}
                  onChange={(e) => ajustar(dia, "inicio", e.target.value)}
                >
                  {HORARIOS_30.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                <span className="text-xs text-muted">às</span>
                <select
                  aria-label={`${nome}: fim`}
                  className="field-input !w-auto !px-2 !py-2 text-sm"
                  value={atual.fim}
                  onChange={(e) => ajustar(dia, "fim", e.target.value)}
                >
                  {HORARIOS_30.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
