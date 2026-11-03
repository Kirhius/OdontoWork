import { Clinica, DiaAgenda, PeriodoAgenda } from "./types";

// Ordem de exibição: segunda a domingo (o número é o do JavaScript: 0 = domingo).
export const DIAS_SEMANA: { dia: number; curto: string; nome: string }[] = [
  { dia: 1, curto: "Seg", nome: "Segunda" },
  { dia: 2, curto: "Ter", nome: "Terça" },
  { dia: 3, curto: "Qua", nome: "Quarta" },
  { dia: 4, curto: "Qui", nome: "Quinta" },
  { dia: 5, curto: "Sex", nome: "Sexta" },
  { dia: 6, curto: "Sáb", nome: "Sábado" },
  { dia: 0, curto: "Dom", nome: "Domingo" },
];

export const ROTULO_PERIODO: Record<PeriodoAgenda, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  dia: "Dia todo",
  horario: "Horário",
};

export function diaDaSemana(iso: string): number {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia).getDay();
}

function minutos(hhmm: string | undefined, padrao: number): number {
  if (!hhmm) return padrao;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// "de manhã", "de tarde", "o dia todo" ou "das 08:00 às 12:00".
export function frasePeriodo(a: DiaAgenda): string {
  switch (a.periodo) {
    case "manha":
      return "de manhã";
    case "tarde":
      return "de tarde";
    case "dia":
      return "o dia todo";
    case "horario":
      return `das ${a.inicio ?? "08:00"} às ${a.fim ?? "12:00"}`;
  }
}

// "manhã", "tarde", "dia todo" ou "08:00 às 12:00" (para listas compactas).
export function rotuloCurtoPeriodo(a: DiaAgenda): string {
  return a.periodo === "horario" ? `${a.inicio ?? "08:00"} às ${a.fim ?? "12:00"}` : ROTULO_PERIODO[a.periodo].toLowerCase();
}

export interface AgendaDoDia {
  clinica: Clinica;
  agenda: DiaAgenda;
}

// Clínicas em que há agenda no dia informado, da mais cedo para a mais tarde.
export function clinicasDoDia(clinicas: Clinica[], iso: string): AgendaDoDia[] {
  const dia = diaDaSemana(iso);
  const inicioMin = (a: DiaAgenda) =>
    a.periodo === "manha" ? 6 * 60 : a.periodo === "tarde" ? 13 * 60 : a.periodo === "dia" ? 0 : minutos(a.inicio, 8 * 60);
  const lista: AgendaDoDia[] = [];
  for (const clinica of clinicas) {
    const agenda = clinica.agenda?.find((a) => a.dia === dia);
    if (agenda) lista.push({ clinica, agenda });
  }
  return lista.sort((x, y) => inicioMin(x.agenda) - inicioMin(y.agenda) || x.clinica.nome.localeCompare(y.clinica.nome, "pt-BR"));
}

// Junta dias iguais: "Seg, qua: manhã · Sex: tarde".
export function resumoAgenda(agenda: DiaAgenda[] | undefined): string {
  if (!agenda || agenda.length === 0) return "";
  const grupos = new Map<string, string[]>();
  for (const d of DIAS_SEMANA) {
    const a = agenda.find((x) => x.dia === d.dia);
    if (!a) continue;
    const chave = rotuloCurtoPeriodo(a);
    grupos.set(chave, [...(grupos.get(chave) ?? []), d.curto]);
  }
  return Array.from(grupos, ([periodo, dias]) => `${dias.join(", ")}: ${periodo}`).join(" · ");
}

export function horarioValido(a: DiaAgenda): boolean {
  return a.periodo !== "horario" || minutos(a.inicio, 0) < minutos(a.fim, 0);
}

// Horários de meia em meia hora para escolher início e fim.
export const HORARIOS_30: string[] = (() => {
  const lista: string[] = [];
  for (let h = 6; h <= 22; h++) {
    lista.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) lista.push(`${String(h).padStart(2, "0")}:30`);
  }
  return lista;
})();
