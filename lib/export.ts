import { Atendimento } from "./types";
import { ROTULO_TIPO, descreverLocal } from "./local";
import { getClinicas, getPacientes } from "./storage";
import { formatarDataBR } from "./data";

interface Linha {
  data: string;
  hora: string;
  paciente: string;
  tipo: string;
  procedimento: string;
  local: string;
  clinica: string;
  pago: string;
}

function montarLinhas(atendimentos: Atendimento[]): Linha[] {
  const pacientes = new Map(getPacientes().map((p) => [p.id, p.nome]));
  const clinicas = new Map(getClinicas().map((c) => [c.id, c.nome]));
  return atendimentos.map((a) => ({
    data: formatarDataBR(a.data),
    hora: a.hora,
    paciente: pacientes.get(a.pacienteId) ?? "Paciente removido",
    tipo: ROTULO_TIPO[a.tipo],
    procedimento: a.procedimentoNome ?? "—",
    local: descreverLocal(a) || "—",
    clinica: (a.clinicaId && clinicas.get(a.clinicaId)) || "—",
    pago: a.pago ? "Sim" : "Não",
  }));
}

export function resumoPorProcedimento(atendimentos: Atendimento[]): { procedimento: string; quantidade: number }[] {
  const mapa = new Map<string, number>();
  for (const a of atendimentos) {
    const nome = a.procedimentoNome ?? ROTULO_TIPO[a.tipo];
    mapa.set(nome, (mapa.get(nome) ?? 0) + 1);
  }
  return Array.from(mapa, ([procedimento, quantidade]) => ({ procedimento, quantidade })).sort(
    (x, y) => y.quantidade - x.quantidade || x.procedimento.localeCompare(y.procedimento, "pt-BR")
  );
}

export async function exportarPDF(atendimentos: Atendimento[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  const linhas = montarLinhas(atendimentos);

  doc.setFontSize(16);
  doc.text("Relatório de procedimentos", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} · ${linhas.length} ${linhas.length === 1 ? "registro" : "registros"}`,
    14,
    24
  );

  autoTable(doc, {
    startY: 30,
    head: [["Data", "Hora", "Paciente", "Tipo", "Procedimento", "Local", "Clínica", "Pago"]],
    body: linhas.map((l) => [l.data, l.hora, l.paciente, l.tipo, l.procedimento, l.local, l.clinica, l.pago]),
    headStyles: { fillColor: [169, 222, 210], textColor: [31, 74, 64] },
    styles: { fontSize: 9 },
  });

  const resumo = resumoPorProcedimento(atendimentos);
  if (resumo.length > 0) {
    const ultimoY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 30;
    autoTable(doc, {
      startY: ultimoY + 10,
      head: [["Procedimento", "Quantidade"]],
      body: resumo.map((r) => [r.procedimento, String(r.quantidade)]),
      headStyles: { fillColor: [250, 247, 242], textColor: [43, 46, 51] },
      styles: { fontSize: 9 },
      tableWidth: 100,
    });
  }

  doc.save(`odontowork-relatorio-${Date.now()}.pdf`);
}

export async function exportarExcel(atendimentos: Atendimento[]) {
  const XLSX = await import("xlsx");
  const linhas = montarLinhas(atendimentos);

  const planilha = XLSX.utils.json_to_sheet(
    linhas.map((l) => ({
      Data: l.data,
      Hora: l.hora,
      Paciente: l.paciente,
      Tipo: l.tipo,
      Procedimento: l.procedimento,
      Local: l.local,
      Clínica: l.clinica,
      Pago: l.pago,
    }))
  );
  planilha["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 28 }, { wch: 12 }, { wch: 26 }, { wch: 18 }, { wch: 22 }, { wch: 7 }];

  const resumo = XLSX.utils.json_to_sheet(
    resumoPorProcedimento(atendimentos).map((r) => ({ Procedimento: r.procedimento, Quantidade: r.quantidade }))
  );
  resumo["!cols"] = [{ wch: 30 }, { wch: 12 }];

  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, "Atendimentos");
  XLSX.utils.book_append_sheet(livro, resumo, "Resumo");
  XLSX.writeFile(livro, `odontowork-relatorio-${Date.now()}.xlsx`);
}
