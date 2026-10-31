import { Atendimento, TipoAtendimento, TipoLocal } from "./types";

export const OPCOES_TIPO_LOCAL: TipoLocal[] = [
  "dente",
  "arcada_superior",
  "arcada_inferior",
  "boca_toda",
];

export function descreverTipoLocal(tipo: TipoLocal): string {
  switch (tipo) {
    case "boca_toda":
      return "Boca toda";
    case "arcada_superior":
      return "Arcada superior";
    case "arcada_inferior":
      return "Arcada inferior";
    case "dente":
      return "Dente";
  }
}

// Dentes do atendimento (aceita o formato antigo, com um dente só), em ordem numérica.
export function listaDentes(a: Pick<Atendimento, "dentes" | "numeroDente">): string[] {
  const lista = a.dentes ?? (a.numeroDente ? [a.numeroDente] : []);
  return ordenarDentes(lista);
}

export function ordenarDentes(dentes: string[]): string[] {
  return [...dentes].sort((x, y) => Number(x) - Number(y));
}

// "Dente 25", "Dentes 14, 15", "Arcada superior", "Boca toda" ou "" quando não há local.
export function descreverLocal(a: Pick<Atendimento, "tipoLocal" | "dentes" | "numeroDente">): string {
  if (!a.tipoLocal) return "";
  if (a.tipoLocal !== "dente") return descreverTipoLocal(a.tipoLocal);
  const dentes = listaDentes(a);
  if (dentes.length === 0) return "Dente";
  return dentes.length === 1 ? `Dente ${dentes[0]}` : `Dentes ${dentes.join(", ")}`;
}

export const ROTULO_TIPO: Record<TipoAtendimento, string> = {
  atendimento: "Atendimento",
  retorno: "Retorno",
  avaliacao: "Avaliação",
};

export function tipoAtendimentoValido(v: string | null | undefined): v is TipoAtendimento {
  return v === "atendimento" || v === "retorno" || v === "avaliacao";
}

// Linha menor do cartão: o procedimento (com "Retorno"/"Avaliação" na frente quando não é atendimento comum).
export function subtituloAtendimento(a: Atendimento): string {
  const partes: string[] = [];
  if (a.tipo !== "atendimento") partes.push(ROTULO_TIPO[a.tipo]);
  if (a.procedimentoNome) partes.push(a.procedimentoNome);
  return partes.join(" · ") || ROTULO_TIPO[a.tipo];
}

// Numeração FDI (padrão odontológico) para o seletor de dente
export const DENTES_FDI: string[] = [
  ...[18, 17, 16, 15, 14, 13, 12, 11].map(String),
  ...[21, 22, 23, 24, 25, 26, 27, 28].map(String),
  ...[48, 47, 46, 45, 44, 43, 42, 41].map(String),
  ...[31, 32, 33, 34, 35, 36, 37, 38].map(String),
];
