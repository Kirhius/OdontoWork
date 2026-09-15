export interface Patient {
  id: string;
  nome: string;
  criadoEm: string; // ISO
}

export type TipoLocal = "boca_toda" | "arcada_superior" | "arcada_inferior" | "dente";

export type LocalProcedimento =
  | { tipo: "boca_toda" }
  | { tipo: "arcada_superior" }
  | { tipo: "arcada_inferior" }
  | { tipo: "dente"; numero: string };

export interface Procedimento {
  id: string;
  patientId: string;
  nome: string;
  local: LocalProcedimento;
  data: string; // YYYY-MM-DD, informada pelo usuário
  criadoEm: string; // ISO, quando foi lançado
  valor?: number; // snapshot da tabela de preços no momento do lançamento (uso interno, só aparece no relatório)
}

export interface Observacao {
  id: string;
  patientId: string;
  texto: string;
  criadoEm: string; // ISO
}

export interface PrecoProcedimento {
  id: string;
  nome: string;
  tipoLocal: TipoLocal;
  valor: number;
}
