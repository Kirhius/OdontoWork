"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { deletePacientes, getAtendimentos, getPacientes, normalizarNome } from "@/lib/storage";
import { formatarDataBR, hojeISO, somarMeses } from "@/lib/data";

interface LinhaPaciente {
  id: string;
  nome: string;
  qtd: number;
  ultimo: string; // data do último atendimento ("" se não houver)
}

export default function LimpezaPage() {
  const [linhas, setLinhas] = useState<LinhaPaciente[]>([]);
  const [busca, setBusca] = useState("");
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function carregar() {
    const atendimentos = getAtendimentos();
    setLinhas(
      getPacientes().map((p) => {
        const dele = atendimentos.filter((a) => a.pacienteId === p.id);
        const ultimo = dele.reduce((maior, a) => (a.data > maior ? a.data : maior), "");
        return { id: p.id, nome: p.nome, qtd: dele.length, ultimo };
      })
    );
  }

  useEffect(carregar, []);

  const visiveis = useMemo(() => {
    const termo = normalizarNome(busca);
    return linhas.filter((l) => !termo || normalizarNome(l.nome).includes(termo));
  }, [linhas, busca]);

  const atendimentosMarcados = linhas.filter((l) => marcados.has(l.id)).reduce((s, l) => s + l.qtd, 0);
  const todosVisiveisMarcados = visiveis.length > 0 && visiveis.every((l) => marcados.has(l.id));

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

  // Atalho: marca quem não tem nenhum atendimento nos últimos 6 meses.
  function marcarAntigos() {
    const limite = somarMeses(hojeISO(), -6);
    setConfirmando(false);
    setMarcados(new Set(linhas.filter((l) => l.ultimo < limite).map((l) => l.id)));
  }

  function excluir() {
    const ids = Array.from(marcados);
    const removidos = deletePacientes(ids);
    setMensagem(
      `${ids.length} ${ids.length === 1 ? "paciente excluído" : "pacientes excluídos"} (${removidos} ${
        removidos === 1 ? "lançamento" : "lançamentos"
      }).`
    );
    setMarcados(new Set());
    setConfirmando(false);
    carregar();
  }

  return (
    <div>
      <PageHeader title="Limpeza" backHref="/configuracoes" />
      <p className="mb-5 text-sm text-muted">
        Marque os pacientes que não precisa mais guardar. Ao excluir, os lançamentos deles saem junto e
        não dá para desfazer.
      </p>

      {mensagem && (
        <p className="mb-4 rounded-lg bg-accent/40 px-3 py-2 text-center text-sm text-accent-ink">{mensagem}</p>
      )}

      {linhas.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">Nenhum paciente salvo.</p>
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

      {marcados.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg">
          <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 py-4">
            {confirmando ? (
              <>
                <p className="flex-1 text-sm">
                  Excluir {marcados.size} {marcados.size === 1 ? "paciente" : "pacientes"} e {atendimentosMarcados}{" "}
                  {atendimentosMarcados === 1 ? "lançamento" : "lançamentos"}?
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
                Excluir {marcados.size} {marcados.size === 1 ? "selecionado" : "selecionados"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
