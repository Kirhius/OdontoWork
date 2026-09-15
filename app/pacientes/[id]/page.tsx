"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import {
  addObservacao,
  addProcedimento,
  deleteObservacao,
  deletePatient,
  deleteProcedimento,
  getObservacoes,
  getPatient,
  getPreco,
  getProcedimentos,
} from "@/lib/storage";
import { Observacao, Patient, Procedimento, LocalProcedimento } from "@/lib/types";
import { descreverLocal, DENTES_FDI } from "@/lib/local";

type Aba = "procedimentos" | "observacoes";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

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

function ProcedimentosTab({ patientId }: { patientId: string }) {
  const [lista, setLista] = useState<Procedimento[]>([]);
  const [nome, setNome] = useState("");
  const [data, setData] = useState(hojeISO());
  const [tipoLocal, setTipoLocal] = useState<LocalProcedimento["tipo"]>("boca_toda");
  const [numeroDente, setNumeroDente] = useState(DENTES_FDI[0]);

  function carregar() {
    setLista(getProcedimentos(patientId));
  }

  useEffect(carregar, [patientId]);

  function handleConcluir() {
    if (!nome.trim()) return;
    const local: LocalProcedimento =
      tipoLocal === "dente" ? { tipo: "dente", numero: numeroDente } : { tipo: tipoLocal };

    // Busca o valor cadastrado na tabela de preços (Configurações > Procedimentos).
    // Esse valor não aparece aqui — só é usado depois nos relatórios.
    const preco = getPreco(nome, tipoLocal);

    addProcedimento({ patientId, nome: nome.trim(), data, local, valor: preco?.valor });
    setNome("");
    carregar();
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="field-label">Procedimento</label>
          <input
            className="field-input"
            placeholder="Ex.: Restauração, Limpeza..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Local</label>
            <select
              className="field-input"
              value={tipoLocal}
              onChange={(e) => setTipoLocal(e.target.value as LocalProcedimento["tipo"])}
            >
              <option value="boca_toda">Boca toda</option>
              <option value="arcada_superior">Arcada superior</option>
              <option value="arcada_inferior">Arcada inferior</option>
              <option value="dente">Dente específico</option>
            </select>
          </div>
          <div>
            <label className="field-label">Data</label>
            <input
              type="date"
              className="field-input"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
        </div>

        {tipoLocal === "dente" && (
          <div>
            <label className="field-label">Número do dente (FDI)</label>
            <select
              className="field-input"
              value={numeroDente}
              onChange={(e) => setNumeroDente(e.target.value)}
            >
              {DENTES_FDI.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={handleConcluir} className="primary-btn" disabled={!nome.trim()}>
          Concluir
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-muted text-center mt-6">
          Nenhum procedimento lançado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((p) => (
            <li key={p.id} className="list-card flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{p.nome}</p>
                <p className="text-xs text-muted mt-0.5">
                  {formatarDataBR(p.data)} · {descreverLocal(p.local)}
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

function formatarDataBR(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
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
