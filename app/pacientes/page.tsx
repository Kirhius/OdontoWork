"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPatients } from "@/lib/storage";
import { Patient } from "@/lib/types";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setPacientes(getPatients());
  }, []);

  const filtrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Pacientes" backHref="/" />

      <input
        className="field-input mb-5"
        placeholder="Buscar paciente..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {filtrados.length === 0 && (
        <p className="text-sm text-muted text-center mt-10">
          {pacientes.length === 0
            ? "Nenhum paciente cadastrado ainda."
            : "Nenhum paciente encontrado."}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {filtrados.map((p) => (
          <li key={p.id}>
            <Link
              href={`/pacientes/${p.id}`}
              className="list-card flex items-center justify-between"
            >
              <span className="font-medium">{p.nome}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
