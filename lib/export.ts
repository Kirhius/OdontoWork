import { Procedimento } from "./types";
import { descreverLocal } from "./local";
import { getPatient } from "./storage";

interface LinhaRelatorio {
  data: string;
  paciente: string;
  procedimento: string;
  local: string;
}

function montarLinhas(procedimentos: Procedimento[]): LinhaRelatorio[] {
  return procedimentos.map((p) => ({
    data: formatarData(p.data),
    paciente: getPatient(p.patientId)?.nome ?? "Paciente removido",
    procedimento: p.nome,
    local: descreverLocal(p.local),
  }));
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

export async function exportarPDF(procedimentos: Procedimento[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const linhas = montarLinhas(procedimentos);

  doc.setFontSize(16);
  doc.text("OdontoWork — Relatório de Procedimentos", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Data", "Paciente", "Procedimento", "Local"]],
    body: linhas.map((l) => [l.data, l.paciente, l.procedimento, l.local]),
    headStyles: { fillColor: [169, 222, 210], textColor: [31, 74, 64] },
    styles: { fontSize: 10 },
  });

  doc.save(`odontowork-relatorio-${Date.now()}.pdf`);
}

export async function exportarExcel(procedimentos: Procedimento[]) {
  const XLSX = await import("xlsx");
  const linhas = montarLinhas(procedimentos);

  const worksheet = XLSX.utils.json_to_sheet(
    linhas.map((l) => ({
      Data: l.data,
      Paciente: l.paciente,
      Procedimento: l.procedimento,
      Local: l.local,
    }))
  );
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 28 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Procedimentos");
  XLSX.writeFile(workbook, `odontowork-relatorio-${Date.now()}.xlsx`);
}
