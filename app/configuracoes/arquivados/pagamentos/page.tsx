"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import PaidButton from "@/components/PaidButton";
import { deleteProcedimento, getAllPatients, getProcedimentos, setProcedimentoPago } from "@/lib/storage";
import { descreverLocal } from "@/lib/local";
import { formatarDataBR } from "@/lib/data";
import { Procedimento } from "@/lib/types";

export default function PagamentosArquivadosPage() {
  const [lista, setLista] = useState<Procedimento[]>([]);
  const [nomes, setNomes] = useState<Record<string, string>>({});

  function carregar() {
    setLista(getProcedimentos().filter((p) => p.pago));
    setNomes(Object.fromEntries(getAllPatients().map((p) => [p.id, p.nome])));
  }

  useEffect(carregar, []);

  return (
    <div>
      <PageHeader title="Pagamentos" backHref="/configuracoes/arquivados" />

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-10">
          Nenhum procedimento pago. Para marcar, toque no $ ao lado do procedimento, dentro do paciente.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted mb-3">
            {lista.length} {lista.length === 1 ? "procedimento pago" : "procedimentos pagos"}. Toque
            no $ para devolver ao histórico do paciente.
          </p>
          <ul className="flex flex-col gap-2.5">
            {lista.map((p) => (
              <li key={p.id} className="list-card flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{p.nome}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {nomes[p.patientId] ?? "Paciente removido"} · {formatarDataBR(p.data)} ·{" "}
                    {descreverLocal(p.local)}
                    {p.clinicaNome ? ` · ${p.clinicaNome}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <PaidButton
                    pago
                    onClick={() => {
                      setProcedimentoPago(p.id, false);
                      carregar();
                    }}
                  />
                  <DeleteButton
                    onConfirm={() => {
                      deleteProcedimento(p.id);
                      carregar();
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
