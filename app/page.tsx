"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import IconeTom from "@/components/IconeTom";
import { dispensarRetorno, getAtendimentosEntre, getRetornosPendentes, RetornoPendente } from "@/lib/storage";
import { formatarDataBR, hojeISO } from "@/lib/data";

const MAX_AVISOS = 3;

export default function Home() {
  const [hoje, setHoje] = useState<{ total: number } | null>(null);
  const [retornos, setRetornos] = useState<RetornoPendente[]>([]);

  const carregar = useCallback(() => {
    const dia = hojeISO();
    setHoje({ total: getAtendimentosEntre(dia, dia).length });
    setRetornos(getRetornosPendentes(dia));
  }, []);

  useEffect(carregar, [carregar]);

  const resumo =
    hoje === null
      ? ""
      : hoje.total === 0
        ? "Nada lançado hoje"
        : `${hoje.total} ${hoje.total === 1 ? "lançamento" : "lançamentos"} hoje`;

  const visiveis = retornos.slice(0, MAX_AVISOS);
  const restantes = retornos.length - visiveis.length;

  return (
    <div className={`flex flex-col ${retornos.length > 0 ? "pb-40" : ""}`}>
      <div className="mb-10 flex items-center gap-3">
        <Logo size={44} />
        <div>
          <h1 className="font-display text-2xl leading-tight text-ink">OdontoWork</h1>
          <p className="text-sm text-muted">Sua agenda de atendimentos</p>
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        <Link href="/atendimentos" className="home-btn">
          <IconeTom tom="a">
            <IconAgenda />
          </IconeTom>
          <span>
            <span className="block font-display text-lg">Atendimentos</span>
            <span className="block min-h-[1.25rem] text-sm text-muted">{resumo}</span>
          </span>
        </Link>

        <Link href="/visao-geral" className="home-btn">
          <IconeTom tom="b">
            <IconVisao />
          </IconeTom>
          <span className="font-display text-lg">Visão geral</span>
        </Link>

        <Link href="/configuracoes" className="home-btn">
          <IconeTom tom="c">
            <IconConfig />
          </IconeTom>
          <span className="font-display text-lg">Configurações</span>
        </Link>
      </nav>

      {/* Avisos de retorno no rodapé da tela inicial */}
      {retornos.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg via-bg to-transparent pt-6">
          <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-5 pb-5">
            {visiveis.map(({ atendimento, paciente }) => {
              const naData = atendimento.retornarEm === hojeISO();
              return (
                <div
                  key={atendimento.id}
                  className="flex items-center gap-2 rounded-xl border border-tone-d bg-tone-d/40 pl-4 pr-2 text-tone-d-ink"
                >
                  <Link href={`/pacientes/${paciente.id}`} className="min-w-0 flex-1 py-3">
                    <span className="block truncate text-sm">
                      Paciente <span className="font-bold">{paciente.nome}</span> tem retorno
                    </span>
                    {!naData && atendimento.retornarEm && (
                      <span className="block text-xs opacity-80">
                        Previsto para {formatarDataBR(atendimento.retornarEm)}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Dispensar aviso de ${paciente.nome}`}
                    title="Dispensar"
                    onClick={() => {
                      dispensarRetorno(atendimento.id);
                      carregar();
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {restantes > 0 && (
              <Link href="/atendimentos" className="text-center text-xs text-muted underline underline-offset-2">
                + {restantes} {restantes === 1 ? "retorno" : "retornos"} na agenda
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconAgenda() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5.5" width="16" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconVisao() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconConfig() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
