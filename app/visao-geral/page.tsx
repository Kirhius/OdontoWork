"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import NavegadorData, { ModoPeriodo, intervaloDoPeriodo } from "@/components/NavegadorData";
import CartaoAtendimento from "@/components/CartaoAtendimento";
import AbasClinica, { ABA_SEM_CLINICA, ABA_TODAS, casaComAba } from "@/components/AbasClinica";
import { getAtendimentosEntre, getClinicas, getPacientes, setAtendimentoPago } from "@/lib/storage";
import { hojeISO, rotuloDia } from "@/lib/data";
import { Atendimento, Clinica } from "@/lib/types";

const MODOS: { id: ModoPeriodo; rotulo: string }[] = [
  { id: "dia", rotulo: "Dia" },
  { id: "semana", rotulo: "Semana" },
  { id: "mes", rotulo: "Mês" },
];

export default function VisaoGeralPage() {
  const [modo, setModo] = useState<ModoPeriodo>("semana");
  const [data, setData] = useState<string | null>(null);
  const [somenteNaoPagos, setSomenteNaoPagos] = useState(false);
  const [aba, setAba] = useState(ABA_TODAS);
  const [lista, setLista] = useState<Atendimento[]>([]);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [clinicas, setClinicas] = useState<Clinica[]>([]);

  const carregar = useCallback((dia: string, m: ModoPeriodo) => {
    const { de, ate } = intervaloDoPeriodo(dia, m);
    setLista(getAtendimentosEntre(de, ate));
    setNomes(Object.fromEntries(getPacientes().map((p) => [p.id, p.nome])));
    setClinicas(getClinicas());
  }, []);

  useEffect(() => {
    const hoje = hojeISO();
    setData(hoje);
    carregar(hoje, "semana");
  }, [carregar]);

  if (!data) return null;

  function mudarModo(m: ModoPeriodo) {
    setModo(m);
    carregar(data as string, m);
  }

  function mudarData(d: string) {
    setData(d);
    carregar(d, modo);
  }

  function alternarPago(a: Atendimento) {
    setAtendimentoPago(a.id, !a.pago);
    carregar(data as string, modo);
  }

  // Contagem por clínica considera o período todo; o resto respeita a aba escolhida.
  const porClinica = [
    ...clinicas.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor })),
    { id: "", nome: "Sem clínica", cor: "" },
  ]
    .map((c) => ({ ...c, qtd: lista.filter((a) => (a.clinicaId ?? "") === c.id).length }))
    .filter((c) => c.qtd > 0);
  const temSemClinica = lista.some((a) => !a.clinicaId || !clinicas.some((c) => c.id === a.clinicaId));

  const daAba = lista.filter((a) => casaComAba(aba, clinicas.some((c) => c.id === a.clinicaId) ? a.clinicaId : undefined));
  const total = daAba.length;
  const pagos = daAba.filter((a) => a.pago).length;
  const visiveis = somenteNaoPagos ? daAba.filter((a) => !a.pago) : daAba;

  const dias = Array.from(new Set(visiveis.map((a) => a.data)));

  return (
    <div>
      <PageHeader title="Visão geral" backHref="/" />

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Período">
        {MODOS.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={modo === m.id}
            className="chip"
            onClick={() => mudarModo(m.id)}
          >
            {m.rotulo}
          </button>
        ))}
      </div>

      <NavegadorData data={data} modo={modo} onChange={mudarData} />

      {clinicas.length > 0 && (
        <AbasClinica
          clinicas={clinicas}
          valor={aba === ABA_SEM_CLINICA && !temSemClinica ? ABA_TODAS : aba}
          onChange={setAba}
          mostrarSemClinica={temSemClinica || aba === ABA_SEM_CLINICA}
        />
      )}

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <Resumo valor={total} rotulo="Lançamentos" />
        <Resumo valor={pagos} rotulo="Pagos" />
        <Resumo valor={total - pagos} rotulo="A receber" />
      </div>

      {aba === ABA_TODAS && porClinica.length > 1 && (
        <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
          {porClinica.map((c) => (
            <li key={c.id || "sem"} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full border border-line"
                style={c.cor ? { backgroundColor: c.cor, borderColor: c.cor } : undefined}
              />
              {c.nome} <span className="font-medium text-ink">{c.qtd}</span>
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <button
          type="button"
          className="chip mb-5"
          aria-pressed={somenteNaoPagos}
          onClick={() => setSomenteNaoPagos((v) => !v)}
        >
          Só os não pagos
        </button>
      )}

      {visiveis.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          {total === 0 ? "Nada lançado nesse período." : "Todos os lançamentos desse período estão pagos."}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {dias.map((dia) => {
            const doDia = visiveis.filter((a) => a.data === dia);
            return (
              <section key={dia}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="font-display text-base">{rotuloDia(dia)}</h2>
                  <Link
                    href={`/atendimentos?data=${dia}`}
                    className="text-xs text-muted underline underline-offset-2"
                  >
                    Abrir dia
                  </Link>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {doDia.map((a) => (
                    <CartaoAtendimento
                      key={a.id}
                      atendimento={a}
                      nomePaciente={nomes[a.pacienteId] ?? "Paciente removido"}
                      clinica={clinicas.find((c) => c.id === a.clinicaId)}
                      onTogglePago={() => alternarPago(a)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Resumo({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-3 text-center">
      <p className="font-display text-2xl leading-none">{valor}</p>
      <p className="mt-1 text-xs text-muted">{rotulo}</p>
    </div>
  );
}
