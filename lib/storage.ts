import { Observacao, Patient, PrecoProcedimento, Procedimento, TipoLocal } from "./types";

const KEYS = {
  patients: "odontowork:patients",
  procedimentos: "odontowork:procedimentos",
  observacoes: "odontowork:observacoes",
  precos: "odontowork:precos",
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

export function getPatients(): Patient[] {
  return read<Patient>(KEYS.patients).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export function getPatient(id: string): Patient | undefined {
  return read<Patient>(KEYS.patients).find((p) => p.id === id);
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

export function deleteProcedimento(id: string) {
  write(
    KEYS.procedimentos,
    read<Procedimento>(KEYS.procedimentos).filter((p) => p.id !== id)
  );
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

// ---- Tabela de preços ----

export function getPrecos(): PrecoProcedimento[] {
  return read<PrecoProcedimento>(KEYS.precos).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export function getPreco(nome: string, tipoLocal: TipoLocal): PrecoProcedimento | undefined {
  const alvo = nome.trim().toLowerCase();
  return read<PrecoProcedimento>(KEYS.precos).find(
    (p) => p.nome.trim().toLowerCase() === alvo && p.tipoLocal === tipoLocal
  );
}

export function addPreco(nome: string, tipoLocal: TipoLocal, valor: number): PrecoProcedimento {
  const precos = read<PrecoProcedimento>(KEYS.precos);
  const novo: PrecoProcedimento = { id: uid(), nome: nome.trim(), tipoLocal, valor };
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
