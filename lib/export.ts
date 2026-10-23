import { LancamentoFinanceiro, Procedimento } from "./types";
import { descreverLocal } from "./local";
import { getPatient, getValorProcedimento } from "./storage";
import { formatarReais } from "./moeda";
import { formatarDataBR } from "./data";

interface LinhaRelatorio {
  data: string;
  paciente: string;
  procedimento: string;
  local: string;
  clinica: string;
  valor: number | undefined;
}

function montarLinhas(procedimentos: Procedimento[]): LinhaRelatorio[] {
  return procedimentos.map((p) => ({
    data: formatarDataBR(p.data),
    paciente: getPatient(p.patientId)?.nome ?? "Paciente removido",
    procedimento: p.nome,
    local: descreverLocal(p.local),
    clinica: p.clinicaNome ?? "—",
    valor: getValorProcedimento(p),
  }));
}

function somarTotal(linhas: LinhaRelatorio[]): number {
  return linhas.reduce((soma, l) => soma + (l.valor ?? 0), 0);
}

export async function exportarPDF(procedimentos: Procedimento[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const linhas = montarLinhas(procedimentos);
  const total = somarTotal(linhas);

  doc.setFontSize(16);
  doc.text("Relatório de procedimentos", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Data", "Paciente", "Procedimento", "Local", "Clínica", "Valor"]],
    body: linhas.map((l) => [
      l.data,
      l.paciente,
      l.procedimento,
      l.local,
      l.clinica,
      typeof l.valor === "number" ? formatarReais(l.valor) : "—",
    ]),
    foot: [["", "", "", "", "Total", formatarReais(total)]],
    headStyles: { fillColor: [169, 222, 210], textColor: [31, 74, 64] },
    footStyles: { fillColor: [250, 247, 242], textColor: [43, 46, 51], fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  doc.save(`odontowork-relatorio-${Date.now()}.pdf`);
}

export async function exportarExcel(procedimentos: Procedimento[]) {
  const XLSX = await import("xlsx");
  const linhas = montarLinhas(procedimentos);
  const total = somarTotal(linhas);

  const worksheet = XLSX.utils.json_to_sheet(
    linhas.map((l) => ({
      Data: l.data,
      Paciente: l.paciente,
      Procedimento: l.procedimento,
      Local: l.local,
      Clínica: l.clinica,
      Valor: typeof l.valor === "number" ? l.valor : "",
    }))
  );
  XLSX.utils.sheet_add_aoa(worksheet, [["", "", "", "", "Total", total]], {
    origin: -1,
  });
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Procedimentos");
  XLSX.writeFile(workbook, `odontowork-relatorio-${Date.now()}.xlsx`);
}

export async function exportarFinanceiroPDF(lancamentos: LancamentoFinanceiro[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const totalComissao = lancamentos.reduce((soma, l) => soma + l.comissao, 0);
  const totalValor = lancamentos.reduce((soma, l) => soma + l.valorTotal, 0);

  doc.setFontSize(16);
  doc.text("Relatório financeiro", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Data", "Paciente", "Valor total", "%", "Comissão"]],
    body: lancamentos.map((l) => [
      formatarDataBR(l.data),
      l.pacienteNome,
      formatarReais(l.valorTotal),
      `${l.percentual}%`,
      formatarReais(l.comissao),
    ]),
    foot: [["", "", formatarReais(totalValor), "Total", formatarReais(totalComissao)]],
    headStyles: { fillColor: [174, 203, 234], textColor: [30, 58, 92] },
    footStyles: { fillColor: [250, 247, 242], textColor: [43, 46, 51], fontStyle: "bold" },
    styles: { fontSize: 10 },
  });

  doc.save(`odontowork-financeiro-${Date.now()}.pdf`);
}
