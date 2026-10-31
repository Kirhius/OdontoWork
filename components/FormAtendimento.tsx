"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import DeleteButton from "@/components/DeleteButton";
import {
  addAtendimento,
  deleteAtendimento,
  getAtendimento,
  getClinicas,
  getPaciente,
  getPacientes,
  getProcedimentosCadastro,
  getUltimaClinicaId,
  setUltimaClinicaId,
  updateAtendimento,
} from "@/lib/storage";
import { agoraHHMM, dataValida, hojeISO } from "@/lib/data";
import { DENTES_FDI, ROTULO_TIPO, descreverTipoLocal, tipoAtendimentoValido } from "@/lib/local";
import { Clinica, Paciente, ProcedimentoCadastro, TipoAtendimento } from "@/lib/types";

const TIPOS: TipoAtendimento[] = ["atendimento", "retorno", "avaliacao"];

const GRUPOS_DENTES: { rotulo: string; dentes: string[] }[] = [
  { rotulo: "Superior direito", dentes: DENTES_FDI.slice(0, 8) },
  { rotulo: "Superior esquerdo", dentes: DENTES_FDI.slice(8, 16) },
  { rotulo: "Inferior direito", dentes: DENTES_FDI.slice(16, 24) },
  { rotulo: "Inferior esquerdo", dentes: DENTES_FDI.slice(24, 32) },
];

// Sem id = novo atendimento (tipo e data podem vir na URL: ?tipo=retorno&data=2026-10-30).
// Com id = consulta e edição do que já foi lançado.
export default function FormAtendimento({ atendimentoId }: { atendimentoId?: string }) {
  const router = useRouter();
  const editando = !!atendimentoId;

  const [pronto, setPronto] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [cadastrados, setCadastrados] = useState<ProcedimentoCadastro[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoAtendimento>("atendimento");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [procId, setProcId] = useState("");
  const [dente, setDente] = useState("");
  const [obs, setObs] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [pago, setPago] = useState(false);
  const [erro, setErro] = useState("");
  // Procedimento que o atendimento tinha mas que foi removido do cadastro depois.
  const [antigo, setAntigo] = useState<ProcedimentoCadastro | null>(null);

  useEffect(() => {
    const listaClinicas = getClinicas();
    const listaProcs = getProcedimentosCadastro();
    setClinicas(listaClinicas);
    setCadastrados(listaProcs);
    setPacientes(getPacientes());

    if (atendimentoId) {
      const a = getAtendimento(atendimentoId);
      if (!a) {
        setNaoEncontrado(true);
        setPronto(true);
        return;
      }
      setNome(getPaciente(a.pacienteId)?.nome ?? "");
      setTipo(a.tipo);
      setData(a.data);
      setHora(a.hora);
      setProcId(a.procedimentoId ?? "");
      setDente(a.numeroDente ?? "");
      setObs(a.observacoes);
      setClinicaId(listaClinicas.some((c) => c.id === a.clinicaId) ? a.clinicaId ?? "" : "");
      setPago(a.pago);
      if (a.procedimentoId && a.procedimentoNome && a.tipoLocal && !listaProcs.some((p) => p.id === a.procedimentoId)) {
        setAntigo({ id: a.procedimentoId, nome: a.procedimentoNome, tipoLocal: a.tipoLocal });
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tipo");
      const d = params.get("data");
      const ultima = getUltimaClinicaId();
      setTipo(tipoAtendimentoValido(t) ? t : "atendimento");
      setData(dataValida(d) ? d : hojeISO());
      setHora(agoraHHMM());
      setClinicaId(listaClinicas.some((c) => c.id === ultima) ? ultima : "");
    }
    setPronto(true);
  }, [atendimentoId]);

  const opcoesProc = antigo ? [...cadastrados, antigo] : cadastrados;
  const procEscolhido = opcoesProc.find((p) => p.id === procId);
  const voltarPara = `/atendimentos${data ? `?data=${data}` : ""}`;

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Digite o nome do paciente.");
      return;
    }
    if (!data || !hora) {
      setErro("Informe data e horário.");
      return;
    }
    if (tipo === "atendimento" && !procEscolhido) {
      setErro("Escolha o procedimento.");
      return;
    }
    if (procEscolhido?.tipoLocal === "dente" && !dente) {
      setErro("Escolha o número do dente.");
      return;
    }

    const dados = {
      nome,
      tipo,
      data,
      hora,
      procedimentoId: procEscolhido?.id,
      procedimentoNome: procEscolhido?.nome,
      tipoLocal: procEscolhido?.tipoLocal,
      numeroDente: procEscolhido?.tipoLocal === "dente" ? dente : undefined,
      observacoes: obs.trim(),
      clinicaId: clinicaId || undefined,
      pago,
    };

    if (atendimentoId) updateAtendimento(atendimentoId, dados);
    else addAtendimento(dados);
    setUltimaClinicaId(clinicaId);
    router.push(`/atendimentos?data=${data}`);
  }

  function excluir() {
    if (!atendimentoId) return;
    deleteAtendimento(atendimentoId);
    router.push(voltarPara);
  }

  if (!pronto) return null;

  if (naoEncontrado) {
    return (
      <div>
        <PageHeader title="Atendimento" backHref="/atendimentos" />
        <p className="mt-6 text-center text-sm text-muted">Esse atendimento não existe mais.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={editando ? ROTULO_TIPO[tipo] : `Novo: ${ROTULO_TIPO[tipo].toLowerCase()}`}
        backHref={voltarPara}
        action={editando ? <DeleteButton onConfirm={excluir} /> : undefined}
      />

      <form onSubmit={salvar} className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo">
          {TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              className="chip"
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
            >
              {ROTULO_TIPO[t]}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="nome" className="field-label">
            Nome do paciente
          </label>
          <input
            id="nome"
            className="field-input"
            placeholder="Ex.: Maria da Silva"
            list="pacientes-existentes"
            autoComplete="off"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <datalist id="pacientes-existentes">
            {pacientes.map((p) => (
              <option key={p.id} value={p.nome} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="data" className="field-label">
              Data
            </label>
            <input
              id="data"
              type="date"
              className="field-input"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="hora" className="field-label">
              Horário
            </label>
            <input
              id="hora"
              type="time"
              className="field-input"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="procedimento" className="field-label">
            Procedimento{tipo !== "atendimento" ? " (opcional)" : ""}
          </label>
          <select
            id="procedimento"
            className="field-input"
            value={procId}
            onChange={(e) => setProcId(e.target.value)}
          >
            <option value="">{tipo === "atendimento" ? "Selecione" : "Nenhum"}</option>
            {opcoesProc.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
                {p === antigo ? " (removido do cadastro)" : ""}
              </option>
            ))}
          </select>
          {cadastrados.length === 0 && (
            <p className="mt-1.5 text-xs text-muted">
              Nenhum procedimento cadastrado.{" "}
              <Link href="/configuracoes/procedimentos" className="underline underline-offset-2">
                Cadastrar em Configurações
              </Link>
            </p>
          )}
        </div>

        {procEscolhido &&
          (procEscolhido.tipoLocal === "dente" ? (
            <div>
              <label htmlFor="dente" className="field-label">
                Dente
              </label>
              <select
                id="dente"
                className="field-input"
                value={dente}
                onChange={(e) => setDente(e.target.value)}
              >
                <option value="">Selecione o dente</option>
                {GRUPOS_DENTES.map((g) => (
                  <optgroup key={g.rotulo} label={g.rotulo}>
                    {g.dentes.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          ) : (
            <p className="-mt-2 text-sm text-muted">
              Local: <span className="font-medium text-ink">{descreverTipoLocal(procEscolhido.tipoLocal)}</span>
            </p>
          ))}

        <div>
          <label htmlFor="clinica" className="field-label">
            Clínica
          </label>
          <select
            id="clinica"
            className="field-input"
            value={clinicaId}
            onChange={(e) => setClinicaId(e.target.value)}
          >
            <option value="">Sem clínica</option>
            {clinicas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {clinicas.length === 0 && (
            <p className="mt-1.5 text-xs text-muted">
              Nenhuma clínica cadastrada.{" "}
              <Link href="/configuracoes/clinicas" className="underline underline-offset-2">
                Cadastrar em Configurações
              </Link>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="obs" className="field-label">
            Observações
          </label>
          <textarea
            id="obs"
            rows={2}
            className="field-input resize-none"
            placeholder="Opcional"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={pago}
            onChange={(e) => setPago(e.target.checked)}
          />
          <span className="text-sm font-medium">Pago pela clínica</span>
        </label>

        {erro && <p className="rounded-lg bg-danger/30 px-3 py-2 text-sm text-danger-ink">{erro}</p>}

        <button type="submit" className="primary-btn">
          Salvar
        </button>
      </form>
    </div>
  );
}
