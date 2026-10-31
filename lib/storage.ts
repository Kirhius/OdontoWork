import {
  Atendimento,
  Clinica,
  Paciente,
  ProcedimentoCadastro,
  TipoAtendimento,
  TipoLocal,
} from "./types";

// Tudo fica no localStorage do navegador. O prefixo v2 separa os dados do modelo novo.
const KEYS = {
  atendimentos: "odontowork:v2:atendimentos",
  pacientes: "odontowork:v2:pacientes",
  procedimentos: "odontowork:v2:procedimentos",
  clinicas: "odontowork:v2:clinicas",
  ultimaClinica: "odontowork:v2:ultima-clinica",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // armazenamento cheio ou bloqueado: nada a fazer aqui
  }
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- Clínicas ----------

export function getClinicas(): Clinica[] {
  return read<Clinica[]>(KEYS.clinicas, []).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function addClinica(nome: string, cor: string): Clinica {
  const nova: Clinica = { id: uid(), nome: nome.trim(), cor };
  write(KEYS.clinicas, [...read<Clinica[]>(KEYS.clinicas, []), nova]);
  return nova;
}

export function updateClinica(id: string, dados: { nome: string; cor: string }) {
  write(
    KEYS.clinicas,
    read<Clinica[]>(KEYS.clinicas, []).map((c) =>
      c.id === id ? { ...c, nome: dados.nome.trim(), cor: dados.cor } : c
    )
  );
}

// Os atendimentos dessa clínica ficam sem clínica (sem cor na borda).
export function deleteClinica(id: string) {
  write(
    KEYS.clinicas,
    read<Clinica[]>(KEYS.clinicas, []).filter((c) => c.id !== id)
  );
  write(
    KEYS.atendimentos,
    read<Atendimento[]>(KEYS.atendimentos, []).map((a) =>
      a.clinicaId === id ? { ...a, clinicaId: undefined } : a
    )
  );
  if (getUltimaClinicaId() === id) setUltimaClinicaId("");
}

export function getUltimaClinicaId(): string {
  return read<string>(KEYS.ultimaClinica, "");
}

export function setUltimaClinicaId(id: string) {
  write(KEYS.ultimaClinica, id);
}

// ---------- Procedimentos (cadastro) ----------

export function getProcedimentosCadastro(): ProcedimentoCadastro[] {
  return read<ProcedimentoCadastro[]>(KEYS.procedimentos, []).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export function addProcedimentoCadastro(nome: string, tipoLocal: TipoLocal): ProcedimentoCadastro {
  const novo: ProcedimentoCadastro = { id: uid(), nome: nome.trim(), tipoLocal };
  write(KEYS.procedimentos, [...read<ProcedimentoCadastro[]>(KEYS.procedimentos, []), novo]);
  return novo;
}

export function updateProcedimentoCadastro(id: string, dados: { nome: string; tipoLocal: TipoLocal }) {
  write(
    KEYS.procedimentos,
    read<ProcedimentoCadastro[]>(KEYS.procedimentos, []).map((p) =>
      p.id === id ? { ...p, nome: dados.nome.trim(), tipoLocal: dados.tipoLocal } : p
    )
  );
}

// Atendimentos já lançados mantêm o nome e o local que tinham.
export function deleteProcedimentoCadastro(id: string) {
  write(
    KEYS.procedimentos,
    read<ProcedimentoCadastro[]>(KEYS.procedimentos, []).filter((p) => p.id !== id)
  );
}

// ---------- Pacientes ----------

export function getPacientes(): Paciente[] {
  return read<Paciente[]>(KEYS.pacientes, []).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function getPaciente(id: string): Paciente | undefined {
  return read<Paciente[]>(KEYS.pacientes, []).find((p) => p.id === id);
}

// Reaproveita o paciente de mesmo nome (sem diferenciar maiúsculas e acentos) ou cria um novo.
export function acharOuCriarPaciente(nome: string): Paciente {
  const lista = read<Paciente[]>(KEYS.pacientes, []);
  const chave = normalizarNome(nome);
  const existente = lista.find((p) => normalizarNome(p.nome) === chave);
  if (existente) return existente;
  const novo: Paciente = { id: uid(), nome: nome.trim().replace(/\s+/g, " ") };
  write(KEYS.pacientes, [...lista, novo]);
  return novo;
}

// Exclui os pacientes e todos os atendimentos deles. Devolve quantos atendimentos saíram.
export function deletePacientes(ids: string[]): number {
  const conjunto = new Set(ids);
  const atendimentos = read<Atendimento[]>(KEYS.atendimentos, []);
  const restantes = atendimentos.filter((a) => !conjunto.has(a.pacienteId));
  write(KEYS.atendimentos, restantes);
  write(
    KEYS.pacientes,
    read<Paciente[]>(KEYS.pacientes, []).filter((p) => !conjunto.has(p.id))
  );
  return atendimentos.length - restantes.length;
}

// ---------- Atendimentos ----------

export interface AtendimentoInput {
  nome: string;
  tipo: TipoAtendimento;
  data: string;
  hora: string;
  procedimentoId?: string;
  procedimentoNome?: string;
  tipoLocal?: TipoLocal;
  dentes?: string[];
  observacoes: string;
  clinicaId?: string;
  pago: boolean;
  retornarEm?: string;
}

export function getAtendimentos(): Atendimento[] {
  return read<Atendimento[]>(KEYS.atendimentos, []);
}

export function getAtendimento(id: string): Atendimento | undefined {
  return getAtendimentos().find((a) => a.id === id);
}

export function ordenarCronologico(lista: Atendimento[]): Atendimento[] {
  return [...lista].sort(
    (a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora) || a.criadoEm - b.criadoEm
  );
}

export function getAtendimentosEntre(de: string, ate: string): Atendimento[] {
  return ordenarCronologico(getAtendimentos().filter((a) => a.data >= de && a.data <= ate));
}

export function addAtendimento(input: AtendimentoInput): Atendimento {
  const { nome, ...resto } = input;
  const paciente = acharOuCriarPaciente(nome);
  const novo: Atendimento = { ...resto, id: uid(), pacienteId: paciente.id, criadoEm: Date.now() };
  write(KEYS.atendimentos, [...getAtendimentos(), novo]);
  return novo;
}

export function updateAtendimento(id: string, input: AtendimentoInput) {
  const { nome, ...resto } = input;
  const atual = getAtendimento(id);
  if (!atual) return;
  const paciente = acharOuCriarPaciente(nome);
  const lista = getAtendimentos().map((a) =>
    a.id === id
      ? {
          ...a,
          ...resto,
          numeroDente: undefined, // some o formato antigo de um dente só
          pacienteId: paciente.id,
          // mudou o dia do retorno: o aviso volta a valer
          retornoDispensado: resto.retornarEm === a.retornarEm ? a.retornoDispensado : undefined,
        }
      : a
  );
  write(KEYS.atendimentos, lista);
  // Se o nome foi trocado e o paciente antigo ficou sem nenhum atendimento, ele sai da lista.
  if (atual.pacienteId !== paciente.id) removerPacienteSemAtendimentos(atual.pacienteId, lista);
}

export function deleteAtendimento(id: string) {
  const atual = getAtendimento(id);
  const lista = getAtendimentos().filter((a) => a.id !== id);
  write(KEYS.atendimentos, lista);
  if (atual) removerPacienteSemAtendimentos(atual.pacienteId, lista);
}

export function setAtendimentoPago(id: string, pago: boolean) {
  write(
    KEYS.atendimentos,
    getAtendimentos().map((a) => (a.id === id ? { ...a, pago } : a))
  );
}

function removerPacienteSemAtendimentos(pacienteId: string, atendimentos: Atendimento[]) {
  if (atendimentos.some((a) => a.pacienteId === pacienteId)) return;
  write(
    KEYS.pacientes,
    read<Paciente[]>(KEYS.pacientes, []).filter((p) => p.id !== pacienteId)
  );
}

// Remove só os atendimentos dessa clínica ("" = sem clínica) dos pacientes marcados.
// Quem ficar sem nenhum atendimento sai da lista de pacientes. Devolve quantos atendimentos saíram.
export function deleteAtendimentosDaClinica(pacienteIds: string[], clinicaId: string): number {
  const alvo = new Set(pacienteIds);
  const atendimentos = getAtendimentos();
  const restantes = atendimentos.filter(
    (a) => !(alvo.has(a.pacienteId) && (a.clinicaId ?? "") === clinicaId)
  );
  write(KEYS.atendimentos, restantes);
  const comAtendimento = new Set(restantes.map((a) => a.pacienteId));
  write(
    KEYS.pacientes,
    read<Paciente[]>(KEYS.pacientes, []).filter((p) => !alvo.has(p.id) || comAtendimento.has(p.id))
  );
  return atendimentos.length - restantes.length;
}

export function getAtendimentosDoPaciente(pacienteId: string): Atendimento[] {
  return ordenarCronologico(getAtendimentos().filter((a) => a.pacienteId === pacienteId)).reverse();
}

// ---------- Retornos ----------

export interface RetornoPendente {
  atendimento: Atendimento; // o atendimento em que o retorno foi marcado
  paciente: Paciente;
}

// Retornos marcados para até a data informada que ainda não aconteceram.
// Some sozinho quando o paciente tem um atendimento em dia posterior ao que marcou o retorno,
// ou quando o aviso é dispensado. Um aviso por paciente (o mais antigo).
export function getRetornosPendentes(ate: string): RetornoPendente[] {
  const todos = getAtendimentos();
  const pacientes = new Map(read<Paciente[]>(KEYS.pacientes, []).map((p) => [p.id, p]));
  const vistos = new Set<string>();
  const saida: RetornoPendente[] = [];

  const candidatos = todos
    .filter((a) => a.retornarEm && !a.retornoDispensado && a.retornarEm <= ate)
    .sort((x, y) => (x.retornarEm as string).localeCompare(y.retornarEm as string));

  for (const a of candidatos) {
    const paciente = pacientes.get(a.pacienteId);
    if (!paciente || vistos.has(a.pacienteId)) continue;
    const voltou = todos.some((o) => o.pacienteId === a.pacienteId && o.data > a.data);
    if (voltou) continue;
    vistos.add(a.pacienteId);
    saida.push({ atendimento: a, paciente });
  }
  return saida;
}

export function dispensarRetorno(atendimentoId: string) {
  write(
    KEYS.atendimentos,
    getAtendimentos().map((a) => (a.id === atendimentoId ? { ...a, retornoDispensado: true } : a))
  );
}
