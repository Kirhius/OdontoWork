"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import {
  dispensarRetorno,
  getAtendimentosDoPaciente,
  getClinicas,
  getPaciente,
  getRetornosPendentes,
} from "@/lib/storage";
import { formatarDataBR } from "@/lib/data";
import { ROTULO_TIPO, descreverLocal } from "@/lib/local";
import { Atendimento, Clinica, Paciente } from "@/lib/types";

// Ficha do paciente: tudo que já foi lançado para ele, do mais recente para o mais antigo.
export default function FichaPacientePage() {
  const params = useParams<{ id: string }>();
  const [pronto, setPronto] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historico, setHistorico] = useState<Atendimento[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [retorno, setRetorno] = useState<Atendimento | null>(null);

  const carregar = useCallback(() => {
    const p = getPaciente(params.id) ?? null;
    setPaciente(p);
    setHistorico(p ? getAtendimentosDoPaciente(p.id) : []);
    setClinicas(getClinicas());
    // Retorno marcado para qualquer data (inclusive futura) que ainda não aconteceu.
    const pendente = p
      ? getRetornosPendentes("9999-12-31").find((r) => r.paciente.id === p.id)
      : undefined;
    setRetorno(pendente?.atendimento ?? null);
    setPronto(true);
  }, [params.id]);

  useEffect(carregar, [carregar]);

  if (!pronto) return null;

  if (!paciente) {
    return (
      <div>
        <PageHeader title="Paciente" backHref="/" />
        <p className="mt-6 text-center text-sm text-muted">Esse paciente não existe mais.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={paciente.nome} backHref="/" />

      {retorno && retorno.retornarEm && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-tone-d bg-tone-d/40 px-4 py-3 text-tone-d-ink">
          <p className="flex-1 text-sm">
            Retorno previsto para <span className="font-bold">{formatarDataBR(retorno.retornarEm)}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              dispensarRetorno(retorno.id);
              carregar();
            }}
            className="shrink-0 text-xs underline underline-offset-2"
          >
            Dispensar
          </button>
        </div>
      )}

      <Link
        href={`/atendimentos/novo?tipo=retorno&nome=${encodeURIComponent(paciente.nome)}`}
        className="primary-btn mb-6 block text-center"
      >
        Registrar retorno
      </Link>

      <h2 className="mb-3 font-display text-base">
        Histórico · {historico.length} {historico.length === 1 ? "lançamento" : "lançamentos"}
      </h2>

      <ul className="flex flex-col gap-2.5">
        {historico.map((a) => {
          const clinica = clinicas.find((c) => c.id === a.clinicaId);
          const local = descreverLocal(a);
          return (
            <li key={a.id}>
              <Link
                href={`/atendimentos/${a.id}`}
                className={`block rounded-xl border border-line border-l-[6px] bg-surface px-4 py-3.5 ${
                  clinica ? "" : "border-l-line"
                }`}
                style={clinica ? { borderLeftColor: clinica.cor } : undefined}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-bold">
                    {formatarDataBR(a.data)} · {a.hora}
                  </span>
                  {a.pago && (
                    <span className="shrink-0 rounded-full bg-paid px-2 py-0.5 text-xs font-semibold text-paid-ink">
                      $ pago
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {a.tipo !== "atendimento" ? `${ROTULO_TIPO[a.tipo]}${a.procedimentoNome ? " · " : ""}` : ""}
                  {a.procedimentoNome ?? (a.tipo === "atendimento" ? "Atendimento" : "")}
                  {local ? ` · ${local}` : ""}
                </span>
                {clinica && <span className="mt-0.5 block text-xs text-muted">{clinica.nome}</span>}
                {a.observacoes && <span className="mt-2 block text-sm">{a.observacoes}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
