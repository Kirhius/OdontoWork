import { LocalProcedimento, TipoLocal } from "./types";

export function descreverLocal(local: LocalProcedimento): string {
  switch (local.tipo) {
    case "boca_toda":
      return "Boca toda";
    case "arcada_superior":
      return "Arcada superior";
    case "arcada_inferior":
      return "Arcada inferior";
    case "dente":
      return `Dente ${local.numero}`;
  }
}

export function descreverTipoLocal(tipo: TipoLocal): string {
  switch (tipo) {
    case "boca_toda":
      return "Boca toda";
    case "arcada_superior":
      return "Arcada superior";
    case "arcada_inferior":
      return "Arcada inferior";
    case "dente":
      return "Dente unitário";
  }
}

// Numeração FDI (padrão odontológico) para o seletor de dente específico
export const DENTES_FDI: string[] = [
  ...[18, 17, 16, 15, 14, 13, 12, 11].map(String),
  ...[21, 22, 23, 24, 25, 26, 27, 28].map(String),
  ...[48, 47, 46, 45, 44, 43, 42, 41].map(String),
  ...[31, 32, 33, 34, 35, 36, 37, 38].map(String),
];
