"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import NavegadorData from "@/components/NavegadorData";
import CartaoAtendimento from "@/components/CartaoAtendimento";
import {
  getAtendimentosEntre,
  getClinicas,
  getPacientes,
  getRetornosPendentes,
  RetornoPendente,
  setAtendimentoPago,
} from "@/lib/storage";
import { dataValida, formatarDataBR, hojeISO } from "@/lib/data";
import { ROTULO_TIPO } from "@/lib/local";
import { Atendimento, Clinica, TipoAtendimento } from "@/lib/types";

const OPCOES_NOVO: { tipo: TipoAtendimento; descricao: string }[] = [
  { tipo: "atendimento", descricao: "Procedimento que você fez" },
  { tipo: "retorno", descricao: "Paciente voltou" },
  { tipo: "avaliacao", descricao: "Primeira consulta ou avaliação" },
];

export default function AtendimentosPage() {
  // null até ler a URL no navegador (evita divergência de data entre build e celular).
  const [data, setData] = useState<string | null>(null);
  const [lista, setLista] = useState<Atendimento[]>([]);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [retornos, setRetornos] = useState<RetornoPendente[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const carregar = useCallback((dia: string) => {
    setLista(getAtendimentosEntre(dia, dia));
    setNomes(Object.fromEntries(getPacientes().map((p) => [p.id, p.nome])));
    setClinicas(getClinicas());
    // Retornos marcados para esse dia (em "hoje" entram também os que ficaram atrasados).
    const hoje = hojeISO();
    setRetornos(
      getRetornosPendentes(dia).filter((r) => r.atendimento.retornarEm === dia || dia === hoje)
    );
  }, []);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("data");
    const dia = dataValida(param) ? param : hojeISO();
    setData(dia);
    carregar(dia);
  }, [carregar]);

  function mudarData(dia: string) {
    setData(dia);
    carregar(dia);
    // Mantém o dia na URL: ao voltar de um atendimento, a agenda abre no mesmo dia.
    window.history.replaceState(null, "", `/atendimentos?data=${dia}`);
  }

  function alternarPago(a: Atendimento) {
    setAtendimentoPago(a.id, !a.pago);
    if (data) carregar(data);
  }

  if (!data) return null;

  const pagos = lista.filter((a) => a.pago).length;

  return (
    <div>
      <PageHeader title="Atendimentos" backHref="/" />
      <NavegadorData data={data} modo="dia" onChange={mudarData} />

      {lista.length > 0 && (
        <p className="mb-3 text-sm text-muted">
          {lista.length} {lista.length === 1 ? "lançamento" : "lançamentos"} · {pagos}{" "}
          {pagos === 1 ? "pago" : "pagos"}
        </p>
      )}

      {retornos.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 font-display text-base">Retornos previstos</h2>
          <ul className="flex flex-col gap-2.5">
            {retornos.map(({ atendimento, paciente }) => (
              <li
                key={atendimento.id}
                className="flex items-center gap-3 rounded-xl border border-dashed border-tone-d bg-tone-d/30 py-3 pl-4 pr-3 text-tone-d-ink"
              >
                <Link href={`/pacientes/${paciente.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{paciente.nome}</span>
                  <span className="block text-sm opacity-80">
                    {atendimento.retornarEm === data
                      ? "Tem retorno hoje"
                      : `Retorno previsto para ${formatarDataBR(atendimento.retornarEm as string)}`}
                  </span>
                </Link>
                <Link
                  href={`/atendimentos/novo?tipo=retorno&data=${data}&nome=${encodeURIComponent(paciente.nome)}`}
                  className="shrink-0 rounded-lg bg-surface px-3 py-2 text-xs font-medium text-ink"
                >
                  Registrar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lista.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          Nada lançado nesse dia.
          <br />
          Toque no + para registrar.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5 pb-24">
          {lista.map((a) => (
            <CartaoAtendimento
              key={a.id}
              atendimento={a}
              nomePaciente={nomes[a.pacienteId] ?? "Paciente removido"}
              clinica={clinicas.find((c) => c.id === a.clinicaId)}
              onTogglePago={() => alternarPago(a)}
            />
          ))}
        </ul>
      )}

      {/* Botão circular "+" (flutua sobre a coluna do app) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-10">
        <div className="mx-auto flex w-full max-w-md justify-end px-5">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Adicionar"
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg transition-transform active:scale-95"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuAberto && (
        <div className="fixed inset-0 z-20 flex items-end bg-ink/40" onClick={() => setMenuAberto(false)}>
          <div
            role="dialog"
            aria-label="Adicionar"
            className="mx-auto w-full max-w-md rounded-t-3xl bg-bg px-5 pb-8 pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 font-display text-lg">Adicionar</p>
            <div className="flex flex-col gap-2.5">
              {OPCOES_NOVO.map((o) => (
                <Link
                  key={o.tipo}
                  href={`/atendimentos/novo?tipo=${o.tipo}&data=${data}`}
                  className="list-card block"
                >
                  <span className="block font-medium">{ROTULO_TIPO[o.tipo]}</span>
                  <span className="block text-xs text-muted">{o.descricao}</span>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="mx-auto mt-4 block text-sm text-muted underline underline-offset-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
