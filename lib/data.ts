// Datas sempre locais (YYYY-MM-DD). Não usa toISOString() para não virar "amanhã"
// depois das 21h no fuso do Brasil (UTC-3).
function paraISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function deISO(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function agoraHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function dataValida(iso: string | null | undefined): iso is string {
  return !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(deISO(iso).getTime());
}

export function somarDias(iso: string, dias: number): string {
  const d = deISO(iso);
  d.setDate(d.getDate() + dias);
  return paraISO(d);
}

export function somarMeses(iso: string, meses: number): string {
  const d = deISO(iso);
  d.setDate(1);
  d.setMonth(d.getMonth() + meses);
  return paraISO(d);
}

// Semana de segunda a domingo.
export function inicioSemana(iso: string): string {
  const d = deISO(iso);
  const dif = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dif);
  return paraISO(d);
}

export function fimSemana(iso: string): string {
  return somarDias(inicioSemana(iso), 6);
}

export function inicioMes(iso: string): string {
  return iso.slice(0, 8) + "01";
}

export function fimMes(iso: string): string {
  const d = deISO(iso);
  return paraISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

function capitalizar(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// "Hoje", "Ontem", "Amanhã" ou "Qui, 30 out".
export function rotuloDia(iso: string): string {
  const hoje = hojeISO();
  if (iso === hoje) return "Hoje";
  if (iso === somarDias(hoje, -1)) return "Ontem";
  if (iso === somarDias(hoje, 1)) return "Amanhã";
  return rotuloDiaCurto(iso);
}

export function rotuloDiaCurto(iso: string): string {
  const texto = deISO(iso)
    .toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    .replace(".", "")
    .replace(/\.$/, "");
  return capitalizar(texto);
}

export function rotuloMes(iso: string): string {
  return capitalizar(deISO(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
}

export function rotuloSemana(iso: string): string {
  const ini = inicioSemana(iso);
  const fim = fimSemana(iso);
  const a = deISO(ini);
  const b = deISO(fim);
  const mes = (d: Date) => d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} a ${b.getDate()} ${mes(b)}`
    : `${a.getDate()} ${mes(a)} a ${b.getDate()} ${mes(b)}`;
}
