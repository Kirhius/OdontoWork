export interface Patient {
  id: string;
  nome: string;
  criadoEm: string; // ISO
  arquivado?: boolean;
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
  clinicaId?: string;
  clinicaNome?: string; // snapshot do nome, para não perder o histórico se a clínica for excluída
  pago?: boolean; // procedimento já pago: sai do histórico do paciente e vai para Arquivados > Pagamentos
}

export interface Observacao {
  id: string;
  patientId: string;
  texto: string;
  criadoEm: string; // ISO
}

// Valor de um procedimento + local em uma clínica.
// Sem clinicaId = tabela "Sem clínica" (inclui os valores cadastrados antes de existir tabela por clínica).
export interface PrecoProcedimento {
  id: string;
  nome: string;
  tipoLocal: TipoLocal;
  valor: number;
  clinicaId?: string;
}

export interface LancamentoFinanceiro {
  id: string;
  pacienteNome: string;
  valorTotal: number;
  percentual: number; // ex.: 2.5 significa 2,5%
  comissao: number; // valorTotal * percentual / 100, calculado no momento do lançamento
  data: string; // YYYY-MM-DD, informada pelo usuário
  criadoEm: string; // ISO
  arquivado?: boolean;
}

export interface Clinica {
  id: string;
  nome: string;
  criadoEm: string; // ISO
}
