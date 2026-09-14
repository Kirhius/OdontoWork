export interface Patient {
  id: string;
  nome: string;
  criadoEm: string; // ISO
}

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
}

export interface Observacao {
  id: string;
  patientId: string;
  texto: string;
  criadoEm: string; // ISO
}
