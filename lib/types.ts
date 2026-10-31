export type TipoLocal = "dente" | "arcada_superior" | "arcada_inferior" | "boca_toda";

export type TipoAtendimento = "atendimento" | "retorno" | "avaliacao";

export interface Clinica {
  id: string;
  nome: string;
  cor: string; // #RRGGBB
}

// Procedimento cadastrado em Configurações (a lista que aparece para escolher no atendimento).
export interface ProcedimentoCadastro {
  id: string;
  nome: string;
  tipoLocal: TipoLocal;
}

export interface Paciente {
  id: string;
  nome: string;
}

export interface Atendimento {
  id: string;
  pacienteId: string;
  tipo: TipoAtendimento;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  // Cópia do procedimento no momento do lançamento: mudar ou apagar o cadastro não altera o histórico.
  procedimentoId?: string;
  procedimentoNome?: string;
  tipoLocal?: TipoLocal;
  numeroDente?: string;
  observacoes: string;
  clinicaId?: string;
  pago: boolean;
  criadoEm: number;
}
