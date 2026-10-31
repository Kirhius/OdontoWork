"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import AbasClinica, { ABA_SEM_CLINICA, ABA_TODAS, casaComAba } from "@/components/AbasClinica";
import {
  deleteAtendimentosDaClinica,
  deletePacientes,
  getAtendimentos,
  getClinicas,
  getPacientes,
  normalizarNome,
} from "@/lib/storage";
import { formatarDataBR, hojeISO, somarMeses } from "@/lib/data";
import { Atendimento, Clinica, Paciente } from "@/lib/types";

interface LinhaPaciente {
  id: string;
  nome: string;
  qtd: number;
  ultimo: string; // data do último atendimento dentro da aba ("" se não houver)
}

export default function LimpezaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [aba, setAba] = useState(ABA_TODAS);
  const [busca, setBusca] = useState("");
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function carregar() {
    setPacientes(getPacientes());
    setAtendimentos(getAtendimentos());
    setClinicas(getClinicas());
  }

  useEffect(carregar, []);

  // Clínica apagada deixa o lançamento "sem clínica".
  const clinicaValida = (a: Atendimento) => (clinicas.some((c) => c.id === a.clinicaId) ? a.clinicaId : undefined);
  const temSemClinica = atendimentos.some((a) => !clinicaValida(a));
  const abaAtual = aba === ABA_SEM_CLINICA && !temSemClinica ? ABA_TODAS : aba;
  const nomeAba =
    abaAtual === ABA_TODAS
      ? ""
      : abaAtual === ABA_SEM_CLINICA
        ? "Sem clínica"
        : clinicas.find((c) => c.id === abaAtual)?.nome ?? "";

  // Só entram na lista os pacientes que têm lançamentos na aba escolhida.
  const linhas: LinhaPaciente[] = useMemo(() => {
    const lista: LinhaPaciente[] = [];
    for (const p of pacientes) {
      const dele = atendimentos.filter((a) => a.pacienteId === p.id && casaComAba(abaAtual, clinicaValida(a)));
      if (dele.length === 0 && abaAtual !== ABA_TODAS) continue;
      const ultimo = dele.reduce((maior, a) => (a.data > maior ? a.data : maior), "");
      lista.push({ id: p.id, nome: p.nome, qtd: dele.length, ultimo });
    }
    return lista;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacientes, atendimentos, clinicas, abaAtual]);

  const visiveis = useMemo(() => {
    const termo = normalizarNome(busca);
    return linhas.filter((l) => !termo || normalizarNome(l.nome).includes(termo));
  }, [linhas, busca]);

  const marcadosNaAba = linhas.filter((l) => marcados.has(l.id));
  const lancamentosMarcados = marcadosNaAba.reduce((s, l) => s + l.qtd, 0);
  const todosVisiveisMarcados = visiveis.length > 0 && visiveis.every((l) => marcados.has(l.id));

  function trocarAba(nova: string) {
    setAba(nova);
    setMarcados(new Set());
    setConfirmando(false);
    setMensagem("");
  }

  function alternar(id: string) {
    setConfirmando(false);
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodos() {
    setConfirmando(false);
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (todosVisiveisMarcados) visiveis.forEach((l) => novo.delete(l.id));
      else visiveis.forEach((l) => novo.add(l.id));
      return novo;
    });
  }

  // Atalho: marca quem não tem nenhum atendimento nos últimos 6 meses (dentro da aba).
  function marcarAntigos() {
    const limite = somarMeses(hojeISO(), -6);
    setConfirmando(false);
    setMarcados(new Set(linhas.filter((l) => l.ultimo < limite).map((l) => l.id)));
  }

  function excluir() {
    const ids = marcadosNaAba.map((l) => l.id);
    const removidos =
      abaAtual === ABA_TODAS
        ? deletePacientes(ids)
        : deleteAtendimentosDaClinica(ids, abaAtual === ABA_SEM_CLINICA ? "" : abaAtual);
    setMensagem(
      abaAtual === ABA_TODAS
        ? `${ids.length} ${ids.length === 1 ? "paciente excluído" : "pacientes excluídos"} (${removidos} ${
            removidos === 1 ? "lançamento" : "lançamentos"
          }).`
        : `${removidos} ${removidos === 1 ? "lançamento excluído" : "lançamentos excluídos"} de ${nomeAba}.`
    );
    setMarcados(new Set());
    setConfirmando(false);
    carregar();
  }

  return (
    <div>
      <PageHeader title="Limpeza" backHref="/configuracoes" />
      <p className="mb-5 text-sm text-muted">
        Marque os pacientes que não precisa mais guardar. Em <strong>Todas</strong>, o paciente e todos os
        lançamentos dele saem. Dentro de uma clínica, saem só os lançamentos dela (o paciente some se ficar
        sem nenhum). Não dá para desfazer.
      </p>

      {pacientes.length > 0 && (
        <AbasClinica
          clinicas={clinicas}
          valor={abaAtual}
          onChange={trocarAba}
          mostrarSemClinica={clinicas.length > 0 && (temSemClinica || abaAtual === ABA_SEM_CLINICA)}
        />
      )}

      {mensagem && (
        <p className="mb-4 rounded-lg bg-accent/40 px-3 py-2 text-center text-sm text-accent-ink">{mensagem}</p>
      )}

      {linhas.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          {pacientes.length === 0 ? "Nenhum paciente salvo." : "Nenhum paciente nessa clínica."}
        </p>
      ) : (
        <>
          <input
            className="field-input mb-3"
            placeholder="Buscar paciente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <button type="button" onClick={alternarTodos} className="text-muted underline underline-offset-2">
              {todosVisiveisMarcados ? "Desmarcar todos" : "Marcar todos"}
              {busca ? " da busca" : ""}
            </button>
            <button type="button" onClick={marcarAntigos} className="text-muted underline underline-offset-2">
              Marcar sem atendimento há 6+ meses
            </button>
          </div>

          <ul className="flex flex-col gap-2.5 pb-28">
            {visiveis.map((l) => (
              <li key={l.id}>
                <label className="list-card flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0"
                    checked={marcados.has(l.id)}
                    onChange={() => alternar(l.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{l.nome}</span>
                    <span className="block text-xs text-muted">
                      {l.qtd} {l.qtd === 1 ? "lançamento" : "lançamentos"}
                      {l.ultimo ? ` · último em ${formatarDataBR(l.ultimo)}` : ""}
                    </span>
                  </span>
                </label>
              </li>
            ))}
            {visiveis.length === 0 && (
              <li className="mt-4 text-center text-sm text-muted">Nenhum paciente com esse nome.</li>
            )}
          </ul>
        </>
      )}

      {marcadosNaAba.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg">
          <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 py-4">
            {confirmando ? (
              <>
                <p className="flex-1 text-sm">
                  {abaAtual === ABA_TODAS
                    ? `Excluir ${marcadosNaAba.length} ${marcadosNaAba.length === 1 ? "paciente" : "pacientes"} e ${lancamentosMarcados} ${lancamentosMarcados === 1 ? "lançamento" : "lançamentos"}?`
                    : `Excluir ${lancamentosMarcados} ${lancamentosMarcados === 1 ? "lançamento" : "lançamentos"} de ${nomeAba}?`}
                </p>
                <button
                  onClick={excluir}
                  className="rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-danger-ink"
                >
                  Excluir
                </button>
                <button onClick={() => setConfirmando(false)} className="px-2 text-sm text-muted">
                  Voltar
                </button>
              </>
            ) : (
              <button onClick={() => setConfirmando(true)} className="primary-btn">
                Excluir {marcadosNaAba.length} {marcadosNaAba.length === 1 ? "selecionado" : "selecionados"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
