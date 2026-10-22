"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import CamposProcedimento, { FormProcedimento, novoForm } from "@/components/CamposProcedimento";
import {
  addObservacao,
  addProcedimento,
  deleteObservacao,
  deletePatient,
  deleteProcedimento,
  getClinicas,
  getObservacoes,
  getPatient,
  getPreco,
  getPrecos,
  getProcedimentos,
  getUltimaClinicaId,
  setUltimaClinicaId,
} from "@/lib/storage";
import { Clinica, Observacao, Patient, Procedimento } from "@/lib/types";
import { descreverLocal, montarLocal } from "@/lib/local";
import { formatarDataBR, hojeISO, rotuloMes } from "@/lib/data";

type Aba = "procedimentos" | "observacoes";

export default function PacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [paciente, setPaciente] = useState<Patient | null | undefined>(undefined);
  const [aba, setAba] = useState<Aba>("procedimentos");

  useEffect(() => {
    setPaciente(getPatient(id) ?? null);
  }, [id]);

  if (paciente === undefined) return null;

  if (paciente === null) {
    return (
      <div>
        <PageHeader title="Paciente" backHref="/pacientes" />
        <p className="text-sm text-muted">Paciente não encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={paciente.nome} backHref="/pacientes" />

      <div className="flex gap-2 mb-6 bg-surface border border-line rounded-xl p-1">
        <button
          onClick={() => setAba("procedimentos")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            aba === "procedimentos" ? "bg-mint text-mint-ink" : "text-muted"
          }`}
        >
          Procedimentos Concluídos
        </button>
        <button
          onClick={() => setAba("observacoes")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            aba === "observacoes" ? "bg-mint text-mint-ink" : "text-muted"
          }`}
        >
          Observações
        </button>
      </div>

      {aba === "procedimentos" ? (
        <ProcedimentosTab patientId={paciente.id} />
      ) : (
        <ObservacoesTab patientId={paciente.id} />
      )}

      <button
        onClick={() => {
          if (confirm(`Excluir o cadastro de ${paciente.nome}? Isso também apaga seus procedimentos e observações.`)) {
            deletePatient(paciente.id);
            router.push("/pacientes");
          }
        }}
        className="mt-10 text-xs text-muted underline underline-offset-2 block mx-auto"
      >
        Excluir cadastro do paciente
      </button>
    </div>
  );
}

interface GrupoMes {
  chave: string; // YYYY-MM
  rotulo: string;
  itens: Procedimento[];
}

// A lista já chega ordenada do mais recente para o mais antigo.
function agruparPorMes(lista: Procedimento[]): GrupoMes[] {
  const grupos: GrupoMes[] = [];
  for (const p of lista) {
    const chave = p.data.slice(0, 7);
    const atual = grupos[grupos.length - 1];
    if (atual && atual.chave === chave) {
      atual.itens.push(p);
    } else {
      grupos.push({ chave, rotulo: rotuloMes(chave), itens: [p] });
    }
  }
  return grupos;
}

function ProcedimentosTab({ patientId }: { patientId: string }) {
  const [lista, setLista] = useState<Procedimento[]>([]);
  const [form, setForm] = useState<FormProcedimento>(novoForm());
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  // Gavetas: por padrão só o mês mais recente fica aberto.
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  function carregar() {
    setLista(getProcedimentos(patientId));
  }

  useEffect(() => {
    carregar();
    const todas = getClinicas();
    setClinicas(todas);
    setSugestoes(Array.from(new Set(getPrecos().map((p) => p.nome))));

    const ultima = getUltimaClinicaId();
    setForm((f) => ({
      ...f,
      data: hojeISO(),
      clinicaId: todas.some((c) => c.id === ultima) ? ultima : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function handleConcluir() {
    if (!form.nome.trim()) return;

    const clinica = clinicas.find((c) => c.id === form.clinicaId);
    // Valor vem da tabela de preços e só aparece nos relatórios.
    const preco = getPreco(form.nome, form.tipoLocal);

    addProcedimento({
      patientId,
      nome: form.nome.trim(),
      local: montarLocal(form.tipoLocal, form.numeroDente),
      data: form.data || hojeISO(),
      valor: preco?.valor,
      clinicaId: clinica?.id,
      clinicaNome: clinica?.nome,
    });

    setUltimaClinicaId(form.clinicaId);
    setForm((f) => ({ ...f, nome: "" }));
    carregar();
  }

  const grupos = agruparPorMes(lista);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-7">
        <CamposProcedimento
          value={form}
          onChange={setForm}
          clinicas={clinicas}
          sugestoes={sugestoes}
        />

        <button onClick={handleConcluir} className="primary-btn" disabled={!form.nome.trim()}>
          Concluir
        </button>
      </div>

      {grupos.length === 0 ? (
        <p className="text-sm text-muted text-center mt-6">
          Nenhum procedimento lançado ainda.
        </p>
      ) : (
        <div>
          <h2 className="text-sm font-medium text-muted mb-2.5">Histórico por mês</h2>
          <div className="flex flex-col gap-2.5">
            {grupos.map((g, i) => {
              const aberto = abertos[g.chave] ?? i === 0;
              return (
                <section
                  key={g.chave}
                  className="rounded-xl border border-line bg-surface overflow-hidden"
                >
                  <button
                    onClick={() => setAbertos((a) => ({ ...a, [g.chave]: !aberto }))}
                    aria-expanded={aberto}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="font-medium">{g.rotulo}</span>
                    <span className="flex items-center gap-2 text-xs text-muted shrink-0">
                      {g.itens.length} {g.itens.length === 1 ? "procedimento" : "procedimentos"}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`transition-transform ${aberto ? "rotate-90" : ""}`}
                      >
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {aberto && (
                    <ul className="flex flex-col gap-2 px-3 pb-3">
                      {g.itens.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-lg bg-bg px-3 py-3 flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium">{p.nome}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {formatarDataBR(p.data)} · {descreverLocal(p.local)}
                              {p.clinicaNome ? ` · ${p.clinicaNome}` : ""}
                            </p>
                          </div>
                          <DeleteButton
                            onConfirm={() => {
                              deleteProcedimento(p.id);
                              carregar();
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ObservacoesTab({ patientId }: { patientId: string }) {
  const [lista, setLista] = useState<Observacao[]>([]);
  const [texto, setTexto] = useState("");

  function carregar() {
    setLista(getObservacoes(patientId));
  }

  useEffect(carregar, [patientId]);

  function handleContinuar() {
    if (!texto.trim()) return;
    addObservacao(patientId, texto);
    setTexto("");
    carregar();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <textarea
          className="field-input min-h-[100px] resize-none"
          placeholder="Escreva uma observação sobre o atendimento ou paciente..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button onClick={handleContinuar} className="primary-btn" disabled={!texto.trim()}>
          Continuar
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-6">
          Nenhuma observação lançada ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((o) => (
            <li key={o.id} className="list-card flex items-start justify-between gap-3">
              <div>
                <p className="text-sm whitespace-pre-wrap">{o.texto}</p>
                <p className="text-xs text-muted mt-1">{formatarDataHoraBR(o.criadoEm)}</p>
              </div>
              <DeleteButton
                onConfirm={() => {
                  deleteObservacao(o.id);
                  carregar();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatarDataHoraBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
