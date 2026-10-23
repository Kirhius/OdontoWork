import {
  Clinica,
  LancamentoFinanceiro,
  Observacao,
  Patient,
  PrecoProcedimento,
  Procedimento,
  TipoLocal,
} from "./types";

const KEYS = {
  patients: "odontowork:patients",
  procedimentos: "odontowork:procedimentos",
  observacoes: "odontowork:observacoes",
  precos: "odontowork:precos",
  lancamentos: "odontowork:lancamentos",
  clinicas: "odontowork:clinicas",
  ultimaClinica: "odontowork:ultima-clinica",
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Pacientes ----

function porNome(a: Patient, b: Patient) {
  return a.nome.localeCompare(b.nome, "pt-BR");
}

// Só os pacientes ativos (a tela Pacientes não mostra os arquivados).
export function getPatients(): Patient[] {
  return read<Patient>(KEYS.patients)
    .filter((p) => !p.arquivado)
    .sort(porNome);
}

export function getPatientsArquivados(): Patient[] {
  return read<Patient>(KEYS.patients)
    .filter((p) => p.arquivado)
    .sort(porNome);
}

// Ativos + arquivados.
export function getAllPatients(): Patient[] {
  return read<Patient>(KEYS.patients).sort(porNome);
}

export function getPatient(id: string): Patient | undefined {
  return read<Patient>(KEYS.patients).find((p) => p.id === id);
}

// Procura também entre os arquivados.
export function findPatientByName(nome: string): Patient | undefined {
  const alvo = nome.trim().toLowerCase();
  return read<Patient>(KEYS.patients).find(
    (p) => p.nome.trim().toLowerCase() === alvo
  );
}

export function addPatient(nome: string): Patient {
  const patients = read<Patient>(KEYS.patients);
  const patient: Patient = {
    id: uid(),
    nome: nome.trim(),
    criadoEm: new Date().toISOString(),
  };
  write(KEYS.patients, [...patients, patient]);
  return patient;
}

export function setPatientArquivado(id: string, arquivado: boolean) {
  write(
    KEYS.patients,
    read<Patient>(KEYS.patients).map((p) => (p.id === id ? { ...p, arquivado } : p))
  );
}

export function deletePatient(id: string) {
  write(
    KEYS.patients,
    read<Patient>(KEYS.patients).filter((p) => p.id !== id)
  );
  write(
    KEYS.procedimentos,
    read<Procedimento>(KEYS.procedimentos).filter((p) => p.patientId !== id)
  );
  write(
    KEYS.observacoes,
    read<Observacao>(KEYS.observacoes).filter((o) => o.patientId !== id)
  );
}

// ---- Procedimentos ----

// Traz todos (pagos e pendentes); quem chama filtra pelo campo "pago".
export function getProcedimentos(patientId?: string): Procedimento[] {
  const all = read<Procedimento>(KEYS.procedimentos);
  const filtered = patientId ? all.filter((p) => p.patientId === patientId) : all;
  return filtered.sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function addProcedimento(
  data: Omit<Procedimento, "id" | "criadoEm">
): Procedimento {
  const procedimentos = read<Procedimento>(KEYS.procedimentos);
  const novo: Procedimento = {
    ...data,
    id: uid(),
    criadoEm: new Date().toISOString(),
  };
  write(KEYS.procedimentos, [...procedimentos, novo]);
  return novo;
}

export function setProcedimentoPago(id: string, pago: boolean) {
  write(
    KEYS.procedimentos,
    read<Procedimento>(KEYS.procedimentos).map((p) => (p.id === id ? { ...p, pago } : p))
  );
}

export function deleteProcedimento(id: string) {
  write(
    KEYS.procedimentos,
    read<Procedimento>(KEYS.procedimentos).filter((p) => p.id !== id)
  );
}

// Valor do procedimento na tabela da clínica em que ele foi feito.
// Calculado na hora de gerar o relatório, então acompanha a tabela atual da clínica.
export function getValorProcedimento(p: Procedimento): number | undefined {
  return getPreco(p.nome, p.local.tipo, p.clinicaId)?.valor;
}

// ---- Observações ----

export function getObservacoes(patientId: string): Observacao[] {
  return read<Observacao>(KEYS.observacoes)
    .filter((o) => o.patientId === patientId)
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}

export function addObservacao(patientId: string, texto: string): Observacao {
  const observacoes = read<Observacao>(KEYS.observacoes);
  const nova: Observacao = {
    id: uid(),
    patientId,
    texto: texto.trim(),
    criadoEm: new Date().toISOString(),
  };
  write(KEYS.observacoes, [...observacoes, nova]);
  return nova;
}

export function deleteObservacao(id: string) {
  write(
    KEYS.observacoes,
    read<Observacao>(KEYS.observacoes).filter((o) => o.id !== id)
  );
}

// ---- Tabela de preços (por clínica) ----

// clinicaId "" = tabela "Sem clínica"; sem argumento = todas as tabelas.
export function getPrecos(clinicaId?: string): PrecoProcedimento[] {
  const todos = read<PrecoProcedimento>(KEYS.precos);
  const lista =
    clinicaId === undefined ? todos : todos.filter((p) => (p.clinicaId ?? "") === clinicaId);
  return lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function getPreco(
  nome: string,
  tipoLocal: TipoLocal,
  clinicaId?: string
): PrecoProcedimento | undefined {
  const alvo = nome.trim().toLowerCase();
  return read<PrecoProcedimento>(KEYS.precos).find(
    (p) =>
      p.nome.trim().toLowerCase() === alvo &&
      p.tipoLocal === tipoLocal &&
      (p.clinicaId ?? "") === (clinicaId ?? "")
  );
}

export function addPreco(
  nome: string,
  tipoLocal: TipoLocal,
  valor: number,
  clinicaId?: string
): PrecoProcedimento {
  const precos = read<PrecoProcedimento>(KEYS.precos);
  const novo: PrecoProcedimento = {
    id: uid(),
    nome: nome.trim(),
    tipoLocal,
    valor,
    ...(clinicaId ? { clinicaId } : {}),
  };
  write(KEYS.precos, [...precos, novo]);
  return novo;
}

export function updatePreco(
  id: string,
  dados: { nome: string; tipoLocal: TipoLocal; valor: number }
) {
  write(
    KEYS.precos,
    read<PrecoProcedimento>(KEYS.precos).map((p) =>
      p.id === id ? { ...p, nome: dados.nome.trim(), tipoLocal: dados.tipoLocal, valor: dados.valor } : p
    )
  );
}

export function deletePreco(id: string) {
  write(KEYS.precos, read<PrecoProcedimento>(KEYS.precos).filter((p) => p.id !== id));
}

// Copia os valores de uma tabela para outra (ignora os que já existem no destino).
// "" = Sem clínica. Devolve quantos valores foram copiados.
export function copiarPrecos(deClinicaId: string, paraClinicaId: string): number {
  const todos = read<PrecoProcedimento>(KEYS.precos);
  const origem = todos.filter((p) => (p.clinicaId ?? "") === deClinicaId);
  const novos: PrecoProcedimento[] = [];

  for (const p of origem) {
    const jaExiste = todos.some(
      (d) =>
        (d.clinicaId ?? "") === paraClinicaId &&
        d.nome.trim().toLowerCase() === p.nome.trim().toLowerCase() &&
        d.tipoLocal === p.tipoLocal
    );
    if (!jaExiste) {
      novos.push({
        id: uid(),
        nome: p.nome,
        tipoLocal: p.tipoLocal,
        valor: p.valor,
        ...(paraClinicaId ? { clinicaId: paraClinicaId } : {}),
      });
    }
  }

  if (novos.length > 0) write(KEYS.precos, [...todos, ...novos]);
  return novos.length;
}

// ---- Lançamentos financeiros ----

export function getLancamentos(): LancamentoFinanceiro[] {
  return read<LancamentoFinanceiro>(KEYS.lancamentos).sort((a, b) =>
    a.data < b.data ? 1 : -1
  );
}

export function getLancamento(id: string): LancamentoFinanceiro | undefined {
  return read<LancamentoFinanceiro>(KEYS.lancamentos).find((l) => l.id === id);
}

export function addLancamento(
  dados: Omit<LancamentoFinanceiro, "id" | "criadoEm">
): LancamentoFinanceiro {
  const lancamentos = read<LancamentoFinanceiro>(KEYS.lancamentos);
  const novo: LancamentoFinanceiro = {
    ...dados,
    id: uid(),
    criadoEm: new Date().toISOString(),
  };
  write(KEYS.lancamentos, [...lancamentos, novo]);
  return novo;
}

export function updateLancamento(
  id: string,
  dados: Omit<LancamentoFinanceiro, "id" | "criadoEm">
) {
  write(
    KEYS.lancamentos,
    read<LancamentoFinanceiro>(KEYS.lancamentos).map((l) =>
      l.id === id ? { ...l, ...dados } : l
    )
  );
}

export function deleteLancamento(id: string) {
  write(
    KEYS.lancamentos,
    read<LancamentoFinanceiro>(KEYS.lancamentos).filter((l) => l.id !== id)
  );
}

export function setLancamentoArquivado(id: string, arquivado: boolean) {
  write(
    KEYS.lancamentos,
    read<LancamentoFinanceiro>(KEYS.lancamentos).map((l) =>
      l.id === id ? { ...l, arquivado } : l
    )
  );
}

// ---- Clínicas ----

export function getClinicas(): Clinica[] {
  return read<Clinica>(KEYS.clinicas).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export function addClinica(nome: string): Clinica {
  const clinicas = read<Clinica>(KEYS.clinicas);
  const nova: Clinica = {
    id: uid(),
    nome: nome.trim(),
    criadoEm: new Date().toISOString(),
  };
  write(KEYS.clinicas, [...clinicas, nova]);
  return nova;
}

// Procedimentos já lançados guardam o nome da clínica (clinicaNome) e os valores dela
// continuam valendo nos relatórios, então excluir uma clínica não apaga o histórico.
export function deleteClinica(id: string) {
  write(KEYS.clinicas, read<Clinica>(KEYS.clinicas).filter((c) => c.id !== id));
}

export function getUltimaClinicaId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEYS.ultimaClinica) ?? "";
  } catch {
    return "";
  }
}

export function setUltimaClinicaId(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEYS.ultimaClinica, id);
  } catch {
    // sem problema: é só uma conveniência
  }
}
