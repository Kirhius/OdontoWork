"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import ArchiveButton from "@/components/ArchiveButton";
import { deletePatient, getPatientsArquivados, setPatientArquivado } from "@/lib/storage";
import { Patient } from "@/lib/types";

export default function PacientesArquivadosPage() {
  const [lista, setLista] = useState<Patient[]>([]);

  function carregar() {
    setLista(getPatientsArquivados());
  }

  useEffect(carregar, []);

  return (
    <div>
      <PageHeader title="Pacientes arquivados" backHref="/configuracoes/arquivados" />

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-10">
          Nenhum paciente arquivado. Para arquivar, abra o paciente e toque em Arquivar.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((p) => (
            <li key={p.id} className="list-card flex items-center justify-between gap-3">
              <Link href={`/pacientes/${p.id}`} className="font-medium flex-1 min-w-0 truncate">
                {p.nome}
              </Link>
              <div className="flex items-center gap-0.5 shrink-0">
                <ArchiveButton
                  arquivado
                  onClick={() => {
                    setPatientArquivado(p.id, false);
                    carregar();
                  }}
                />
                <DeleteButton
                  onConfirm={() => {
                    deletePatient(p.id);
                    carregar();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
