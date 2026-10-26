import { Clinica, Patient, TipoLocal } from "./types";

// Interpreta uma frase falada ou digitada, por regras (sem IA), como:
//   "Paciente Marcelo restauração 25"
//   "Maria da Silva limpeza boca toda ontem na clínica Sorriso"
// e devolve os campos do cadastro. Nada é salvo aqui: quem chama só preenche o formulário.

export interface ContextoVoz {
  procedimentos: string[]; // nomes já conhecidos (tabela de valores + histórico)
  clinicas: Clinica[];
  pacientes: Patient[]; // ativos e arquivados
  hoje?: Date;
}

export interface ResultadoVoz {
  paciente: string;
  procedimento: string;
  tipoLocal?: TipoLocal;
  numeroDente?: string;
  data?: string; // YYYY-MM-DD
  clinicaId?: string;
  avisos: string[];
}

interface Token {
  orig: string;
  norm: string;
  usado: boolean;
}

const CONECTORES = new Set(["da", "de", "do", "das", "dos", "e"]);

// Palavras que não fazem parte de nome de paciente nem de procedimento.
const PALAVRAS_SOLTAS = new Set([
  "paciente", "pacientes", "procedimento", "fiz", "fez", "fizemos", "realizei", "realizado",
  "feito", "feita", "de", "do", "da", "dos", "das", "no", "na", "nos", "nas", "em", "o", "a",
  "os", "as", "um", "uma", "para", "com", "e", "dente", "elemento", "dia", "clinica", "hoje",
  "ontem", "anteontem", "arcada", "arco", "boca", "toda", "inteira", "completa", "superior",
  "inferior", "lancar", "lance", "cadastrar", "cadastre", "registrar", "registre", "adicionar",
]);

const UNIDADES = new Map<string, number>([
  ["um", 1], ["uma", 1], ["dois", 2], ["duas", 2], ["tres", 3], ["quatro", 4],
  ["cinco", 5], ["seis", 6], ["sete", 7], ["oito", 8], ["nove", 9],
]);

const ESPECIAIS = new Map<string, number>([
  ["dez", 10], ["onze", 11], ["doze", 12], ["treze", 13], ["catorze", 14], ["quatorze", 14],
  ["quinze", 15], ["dezesseis", 16], ["dezessete", 17], ["dezoito", 18], ["dezenove", 19],
]);

const DEZENAS = new Map<string, number>([
  ["vinte", 20], ["trinta", 30], ["quarenta", 40], ["cinquenta", 50],
]);

const MESES = new Map<string, number>([
  ["janeiro", 1], ["fevereiro", 2], ["marco", 3], ["abril", 4], ["maio", 5], ["junho", 6],
  ["julho", 7], ["agosto", 8], ["setembro", 9], ["outubro", 10], ["novembro", 11], ["dezembro", 12],
]);

const CLINICA_GENERICAS = new Set(["clinica", "odontologia", "odonto"]);

// ---------- utilitários ----------

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function tokenizar(texto: string): Token[] {
  return texto
    .replace(/[,;:!?"“”()]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter(Boolean)
    .map((orig) => ({ orig, norm: normalizar(orig), usado: false }));
}

function ehNumero(t: Token): boolean {
  return /^\d+$/.test(t.norm);
}

function ehDenteValido(n: string): boolean {
  return /^[1-4][1-8]$/.test(n);
}

function titulo(tokens: Token[]): string {
  return tokens
    .map((t, i) => {
      const w = t.orig.toLowerCase();
      return i > 0 && CONECTORES.has(t.norm) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function primeiraMaiuscula(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Aproxima singular e plural ("restaurações" = "restauração").
function chave(w: string): string {
  let r = w.replace(/(oes|aes)$/, "ao");
  if (r.length > 3 && r.endsWith("s")) r = r.slice(0, -1);
  return r;
}

const igualExato = (a: string, b: string) => a === b;
const igualChave = (a: string, b: string) => chave(a) === chave(b);

function acharSequencia(
  tokens: Token[],
  seq: string[],
  igual: (a: string, b: string) => boolean
): number {
  if (seq.length === 0) return -1;
  for (let i = 0; i + seq.length <= tokens.length; i++) {
    let ok = true;
    for (let k = 0; k < seq.length; k++) {
      const t = tokens[i + k];
      if (t.usado || !igual(t.norm, seq[k])) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

function marcar(tokens: Token[], inicio: number, qtd: number) {
  for (let k = 0; k < qtd; k++) tokens[inicio + k].usado = true;
}

// Tira palavras soltas do começo e do fim ("paciente", "de", "fiz"...), mantendo as do meio
// (para não estragar "Maria da Silva").
function aparar(tokens: Token[]): Token[] {
  let ini = 0;
  let fim = tokens.length;
  while (ini < fim && PALAVRAS_SOLTAS.has(tokens[ini].norm)) ini++;
  while (fim > ini && PALAVRAS_SOLTAS.has(tokens[fim - 1].norm)) fim--;
  return tokens.slice(ini, fim);
}

// ---------- números por extenso ----------

function numeroToken(v: number): Token {
  return { orig: String(v), norm: String(v), usado: false };
}

// "vinte e cinco" -> 25, "dois cinco" -> 25, "dente um" -> 1, "quinze" -> 15.
// "um"/"uma" sozinhos continuam sendo artigo ("fiz uma restauração").
function converterNumeros(tokens: Token[]): Token[] {
  const saida: Token[] = [];
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i].norm;
    const ant = saida.length > 0 ? saida[saida.length - 1].norm : "";

    if (DEZENAS.has(t)) {
      let v = DEZENAS.get(t)!;
      let consumo = 1;
      const e = tokens[i + 1]?.norm;
      const u = tokens[i + 2]?.norm;
      if (e === "e" && u !== undefined && UNIDADES.has(u)) {
        v += UNIDADES.get(u)!;
        consumo = 3;
      }
      saida.push(numeroToken(v));
      i += consumo;
      continue;
    }

    if (ESPECIAIS.has(t)) {
      saida.push(numeroToken(ESPECIAIS.get(t)!));
      i++;
      continue;
    }

    if (UNIDADES.has(t)) {
      const prox = tokens[i + 1]?.norm;
      if (prox !== undefined && UNIDADES.has(prox)) {
        saida.push(numeroToken(UNIDADES.get(t)! * 10 + UNIDADES.get(prox)!));
        i += 2;
        continue;
      }
      if (ant === "dente" || ant === "dia" || ant === "elemento") {
        saida.push(numeroToken(UNIDADES.get(t)!));
        i++;
        continue;
      }
    }

    saida.push({ ...tokens[i] });
    i++;
  }

  return saida;
}

// ---------- data ----------

function iso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function criarData(ano: number, mes: number, dia: number): Date | null {
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia ? d : null;
}

// "dia 20": o dia 20 deste mês; se ainda não chegou, o do mês anterior (procedimento já feito).
function resolverDia(dia: number, hoje: Date): Date | null {
  const atual = criarData(hoje.getFullYear(), hoje.getMonth() + 1, dia);
  if (atual && iso(atual) <= iso(hoje)) return atual;
  const ref = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  return criarData(ref.getFullYear(), ref.getMonth() + 1, dia);
}

function resolverDiaMes(dia: number, mes: number, ano: number | undefined, hoje: Date): Date | null {
  if (ano !== undefined) return criarData(ano, mes, dia);
  const a = criarData(hoje.getFullYear(), mes, dia);
  if (a && iso(a) <= iso(hoje)) return a;
  return criarData(hoje.getFullYear() - 1, mes, dia);
}

function extrairData(tokens: Token[], hoje: Date, avisos: string[]): string | undefined {
  const dias = (n: number) => iso(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - n));

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.usado) continue;

    if (t.norm === "hoje") {
      t.usado = true;
      return dias(0);
    }
    if (t.norm === "ontem") {
      t.usado = true;
      return dias(1);
    }
    if (t.norm === "anteontem") {
      t.usado = true;
      return dias(2);
    }

    // 20/10 ou 20/10/2026
    const m = t.norm.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (m) {
      t.usado = true;
      const ano = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : undefined;
      const d = resolverDiaMes(Number(m[1]), Number(m[2]), ano, hoje);
      if (d) return iso(d);
      avisos.push(`Não reconheci a data "${t.orig}".`);
      return undefined;
    }

    // "dia 20", "dia 20 de outubro" ou "20 de outubro"
    const comDia = t.norm === "dia" && /^\d{1,2}$/.test(tokens[i + 1]?.norm ?? "");
    const idx = comDia ? i + 1 : i;
    if (!/^\d{1,2}$/.test(tokens[idx]?.norm ?? "")) continue;

    const dia = Number(tokens[idx].norm);
    const mesNome = tokens[idx + 2]?.norm ?? "";
    const temMes = tokens[idx + 1]?.norm === "de" && MESES.has(mesNome);

    if (temMes) {
      marcar(tokens, i, idx + 3 - i);
      const d = resolverDiaMes(dia, MESES.get(mesNome)!, undefined, hoje);
      if (d) return iso(d);
      avisos.push(`Não reconheci a data "${dia} de ${mesNome}".`);
      return undefined;
    }

    if (comDia) {
      marcar(tokens, i, 2);
      const d = resolverDia(dia, hoje);
      if (d) return iso(d);
      avisos.push(`Não reconheci o dia ${dia}.`);
      return undefined;
    }
  }
  return undefined;
}

// ---------- clínica ----------

function extrairClinica(tokens: Token[], clinicas: Clinica[]): string | undefined {
  const candidatas = clinicas
    .map((c) => {
      const todas = normalizar(c.nome).trim().split(/\s+/).filter(Boolean);
      const chaves = todas.filter((w) => !CLINICA_GENERICAS.has(w));
      return { id: c.id, seq: chaves.length > 0 ? chaves : todas };
    })
    .filter((c) => c.seq.length > 0)
    .sort((a, b) => b.seq.length - a.seq.length);

  for (const c of candidatas) {
    const pos = acharSequencia(tokens, c.seq, igualExato);
    if (pos >= 0) {
      marcar(tokens, pos, c.seq.length);
      return c.id;
    }
  }
  return undefined;
}

// ---------- local ----------

function extrairLocal(tokens: Token[], avisos: string[]): { tipo?: TipoLocal; dente?: string } {
  // "dente 25"
  for (let i = 0; i < tokens.length - 1; i++) {
    const t = tokens[i];
    const p = tokens[i + 1];
    if (t.usado || p.usado) continue;
    if ((t.norm === "dente" || t.norm === "elemento") && ehNumero(p)) {
      t.usado = true;
      p.usado = true;
      if (ehDenteValido(p.norm)) return { tipo: "dente", dente: p.norm };
      avisos.push(`"${p.norm}" não é um dente válido (use de 11 a 48).`);
      return {};
    }
  }

  // "arcada superior" / "arcada inferior"
  for (let i = 0; i < tokens.length - 1; i++) {
    const t = tokens[i];
    const p = tokens[i + 1];
    if (t.usado || p.usado) continue;
    if ((t.norm === "arcada" || t.norm === "arco") && (p.norm === "superior" || p.norm === "inferior")) {
      t.usado = true;
      p.usado = true;
      return { tipo: p.norm === "superior" ? "arcada_superior" : "arcada_inferior" };
    }
  }

  // "boca toda"
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.usado || t.norm !== "boca") continue;
    t.usado = true;
    const p = tokens[i + 1];
    if (p && !p.usado && ["toda", "inteira", "completa"].includes(p.norm)) p.usado = true;
    return { tipo: "boca_toda" };
  }

  // número solto, como em "restauração 25"
  for (const t of tokens) {
    if (t.usado || !ehNumero(t) || !ehDenteValido(t.norm)) continue;
    t.usado = true;
    return { tipo: "dente", dente: t.norm };
  }

  return {};
}

// ---------- procedimento ----------

function extrairProcedimento(tokens: Token[], nomes: string[]): string {
  const vistos = new Set<string>();
  const lista: { nome: string; seq: string[] }[] = [];

  for (const n of nomes) {
    const norm = normalizar(n).trim();
    if (!norm || vistos.has(norm)) continue;
    vistos.add(norm);
    lista.push({ nome: n.trim(), seq: norm.split(/\s+/) });
  }
  lista.sort((a, b) => b.seq.length - a.seq.length);

  for (const c of lista) {
    const pos = acharSequencia(tokens, c.seq, igualChave);
    if (pos >= 0) {
      marcar(tokens, pos, c.seq.length);
      return c.nome;
    }
  }
  return "";
}

// ---------- principal ----------

export function interpretarFala(texto: string, ctx: ContextoVoz): ResultadoVoz {
  const hoje = ctx.hoje ?? new Date();
  const avisos: string[] = [];
  const resultado: ResultadoVoz = { paciente: "", procedimento: "", avisos };

  const tokens = converterNumeros(tokenizar(texto));
  if (tokens.length === 0) {
    avisos.push("Não entendi a frase.");
    return resultado;
  }

  resultado.data = extrairData(tokens, hoje, avisos);
  resultado.clinicaId = extrairClinica(tokens, ctx.clinicas);

  const local = extrairLocal(tokens, avisos);
  resultado.tipoLocal = local.tipo;
  resultado.numeroDente = local.dente;

  resultado.procedimento = extrairProcedimento(tokens, ctx.procedimentos);

  // Paciente já cadastrado (o nome mais longo primeiro, para "Maria Silva" ganhar de "Maria").
  let cadastrado = false;
  const pacientes = ctx.pacientes
    .map((p) => ({ nome: p.nome, seq: normalizar(p.nome).trim().split(/\s+/).filter(Boolean) }))
    .filter((p) => p.seq.length > 0)
    .sort((a, b) => b.seq.length - a.seq.length);

  for (const p of pacientes) {
    const pos = acharSequencia(tokens, p.seq, igualExato);
    if (pos >= 0) {
      marcar(tokens, pos, p.seq.length);
      resultado.paciente = p.nome;
      cadastrado = true;
      break;
    }
  }

  // O que sobrou: nome do paciente (e, se for o caso, um procedimento novo).
  const sobras = aparar(tokens.filter((t) => !t.usado));
  for (const n of sobras.filter(ehNumero)) {
    avisos.push(`Ignorei o número ${n.norm}: dentes vão de 11 a 48.`);
  }
  let palavras = aparar(sobras.filter((t) => !ehNumero(t)));

  if (!resultado.procedimento) {
    if (cadastrado && palavras.length > 0) {
      resultado.procedimento = primeiraMaiuscula(palavras.map((t) => t.orig).join(" "));
      palavras = [];
      avisos.push(`"${resultado.procedimento}" é um procedimento novo (não está na tabela de valores).`);
    } else if (!cadastrado && resultado.tipoLocal && palavras.length >= 2) {
      // Falou um local (dente/arcada), então provavelmente falou um procedimento que o app não conhece:
      // assume que a última palavra é o procedimento.
      const ultimo = palavras[palavras.length - 1];
      palavras = palavras.slice(0, -1);
      resultado.procedimento = primeiraMaiuscula(ultimo.orig.toLowerCase());
      avisos.push(`"${resultado.procedimento}" é um procedimento novo: confira o nome do paciente e o procedimento.`);
    }
  }

  if (!cadastrado) resultado.paciente = titulo(palavras);
  if (!resultado.paciente) avisos.push("Não identifiquei o nome do paciente.");

  return resultado;
}

// Pacientes cadastrados que contêm o nome falado (ex.: falou "Marcelo", existe "Marcelo Souza").
// Serve para o app oferecer a escolha em vez de criar um paciente duplicado.
export function pacientesParecidos(nome: string, pacientes: Patient[]): Patient[] {
  const alvo = normalizar(nome).trim();
  if (!alvo) return [];
  if (pacientes.some((p) => normalizar(p.nome).trim() === alvo)) return [];

  const palavras = alvo.split(/\s+/);
  return pacientes
    .filter((p) => {
      const nomes = normalizar(p.nome).trim().split(/\s+/);
      return palavras.every((w) => nomes.includes(w));
    })
    .slice(0, 4);
}
