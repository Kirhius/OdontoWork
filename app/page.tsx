"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getAtendimentosEntre } from "@/lib/storage";
import { hojeISO } from "@/lib/data";

export default function Home() {
  const [hoje, setHoje] = useState<{ total: number; naoPagos: number } | null>(null);

  useEffect(() => {
    const lista = getAtendimentosEntre(hojeISO(), hojeISO());
    setHoje({ total: lista.length, naoPagos: lista.filter((a) => !a.pago).length });
  }, []);

  const resumo =
    hoje === null
      ? ""
      : hoje.total === 0
        ? "Nada lançado hoje"
        : `${hoje.total} ${hoje.total === 1 ? "lançamento" : "lançamentos"} hoje`;

  return (
    <div className="flex flex-col">
      <div className="mb-10 flex items-center gap-3">
        <Logo size={44} />
        <div>
          <h1 className="font-display text-2xl leading-tight text-ink">OdontoWork</h1>
          <p className="text-sm text-muted">Sua agenda de atendimentos</p>
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        <Link href="/atendimentos" className="home-btn">
          <IconAgenda />
          <span>
            <span className="block font-display text-lg">Atendimentos</span>
            <span className="block min-h-[1.25rem] text-sm text-muted">{resumo}</span>
          </span>
        </Link>

        <Link href="/visao-geral" className="home-btn">
          <IconVisao />
          <span className="font-display text-lg">Visão geral</span>
        </Link>

        <Link href="/configuracoes" className="home-btn">
          <IconConfig />
          <span className="font-display text-lg">Configurações</span>
        </Link>
      </nav>
    </div>
  );
}

function IconAgenda() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="4" y="5.5" width="16" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconVisao() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconConfig() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
