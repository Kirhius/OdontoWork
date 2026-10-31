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
import { agoraHHMM, dataValida, hojeISO, somarDias } from "@/lib/data";
import {
  DENTES_FDI,
  ROTULO_TIPO,
  descreverTipoLocal,
  listaDentes,
  ordenarDentes,
  tipoAtendimentoValido,
} from "@/lib/local";
import { Clinica, Paciente, ProcedimentoCadastro, TipoAtendimento } from "@/lib/types";

const TIPOS: TipoAtendimento[] = ["atendimento", "retorno", "avaliacao"];

const GRUPOS_DENTES: { rotulo: string; dentes: string[] }[] = [
  { rotulo: "Superior direito", dentes: DENTES_FDI.slice(0, 8) },
  { rotulo: "Superior esquerdo", dentes: DENTES_FDI.slice(8, 16) },
  { rotulo: "Inferior direito", dentes: DENTES_FDI.slice(16, 24) },
  { rotulo: "Inferior esquerdo", dentes: DENTES_FDI.slice(24, 32) },
];

// Horários redondos, de meia em meia hora (06:00, 06:30, 07:00 ... 22:00).
const HORARIOS: string[] = (() => {
  const lista: string[] = [];
  for (let h = 6; h <= 22; h++) {
    lista.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) lista.push(`${String(h).padStart(2, "0")}:30`);
  }
  return lista;
})();

// Hora atual arredondada para o horário redondo mais próximo.
function horaRedondaAgora(): string {
  const [h, m] = agoraHHMM().split(":").map(Number);
  const total = Math.round((h * 60 + m) / 30) * 30;
  const limitado = Math.min(Math.max(total, 6 * 60), 22 * 60);
  return `${String(Math.floor(limitado / 60)).padStart(2, "0")}:${String(limitado % 60).padStart(2, "0")}`;
}

// Sem id = novo atendimento (a URL pode trazer ?tipo=retorno&data=2026-10-30&nome=Maria).
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
  const [pacienteId, setPacienteId] = useState("");
  const [tipo, setTipo] = useState<TipoAtendimento>("atendimento");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [procId, setProcId] = useState("");
  const [dentes, setDentes] = useState<string[]>([]);
  const [obs, setObs] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [retornarEm, setRetornarEm] = useState("");
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
      setPacienteId(a.pacienteId);
      setTipo(a.tipo);
      setData(a.data);
      setHora(a.hora);
      setProcId(a.procedimentoId ?? "");
      setDentes(listaDentes(a));
      setObs(a.observacoes);
      setClinicaId(listaClinicas.some((c) => c.id === a.clinicaId) ? a.clinicaId ?? "" : "");
      setRetornarEm(a.retornarEm ?? "");
      setPago(a.pago);
      if (a.procedimentoId && a.procedimentoNome && a.tipoLocal && !listaProcs.some((p) => p.id === a.procedimentoId)) {
        setAntigo({ id: a.procedimentoId, nome: a.procedimentoNome, tipoLocal: a.tipoLocal });
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tipo");
      const d = params.get("data");
      const n = params.get("nome");
      const ultima = getUltimaClinicaId();
      setTipo(tipoAtendimentoValido(t) ? t : "atendimento");
      setData(dataValida(d) ? d : hojeISO());
      setHora(horaRedondaAgora());
      if (n) setNome(n);
      setClinicaId(listaClinicas.some((c) => c.id === ultima) ? ultima : "");
    }
    setPronto(true);
  }, [atendimentoId]);

  const opcoesProc = antigo ? [...cadastrados, antigo] : cadastrados;
  const procEscolhido = opcoesProc.find((p) => p.id === procId);
  const voltarPara = `/atendimentos${data ? `?data=${data}` : ""}`;
  // Se o horário salvo não é redondo (lançamento antigo), ele continua disponível na lista.
  const horarios = hora && !HORARIOS.includes(hora) ? [...HORARIOS, hora].sort() : HORARIOS;

  function alternarDente(d: string) {
    setDentes((atual) => ordenarDentes(atual.includes(d) ? atual.filter((x) => x !== d) : [...atual, d]));
  }

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
    if (procEscolhido?.tipoLocal === "dente" && dentes.length === 0) {
      setErro("Marque pelo menos um dente.");
      return;
    }
    if (retornarEm && retornarEm <= data) {
      setErro("O retorno precisa ser em um dia depois do atendimento.");
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
      dentes: procEscolhido?.tipoLocal === "dente" ? dentes : undefined,
      observacoes: obs.trim(),
      clinicaId: clinicaId || undefined,
      pago,
      retornarEm: retornarEm || undefined,
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
          {editando && pacienteId && (
            <Link
              href={`/pacientes/${pacienteId}`}
              className="mt-1.5 inline-block text-xs text-muted underline underline-offset-2"
            >
              Ver ficha do paciente
            </Link>
          )}
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
            <select id="hora" className="field-input" value={hora} onChange={(e) => setHora(e.target.value)}>
              {horarios.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
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
              <span className="field-label">Dentes (toque para marcar um ou mais)</span>
              <div className="flex flex-col gap-3">
                {GRUPOS_DENTES.map((g) => (
                  <div key={g.rotulo}>
                    <p className="mb-1 text-xs text-muted">{g.rotulo}</p>
                    <div className="grid grid-cols-8 gap-1.5">
                      {g.dentes.map((d) => {
                        const marcado = dentes.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            aria-pressed={marcado}
                            onClick={() => alternarDente(d)}
                            className={`h-10 rounded-lg border text-sm tabular-nums transition-colors ${
                              marcado
                                ? "border-accent bg-accent font-semibold text-accent-ink"
                                : "border-line bg-surface text-muted"
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">
                {dentes.length === 0 ? (
                  "Nenhum dente marcado."
                ) : (
                  <>
                    {dentes.length === 1 ? "Dente " : "Dentes "}
                    <span className="font-medium text-ink">{dentes.join(", ")}</span>
                  </>
                )}
              </p>
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

        <div>
          <label htmlFor="retorno" className="field-label">
            Retornar em (opcional)
          </label>
          <div className="flex items-center gap-3">
            <input
              id="retorno"
              type="date"
              className="field-input"
              min={data ? somarDias(data, 1) : undefined}
              value={retornarEm}
              onChange={(e) => setRetornarEm(e.target.value)}
            />
            {retornarEm && (
              <button
                type="button"
                onClick={() => setRetornarEm("")}
                className="shrink-0 text-sm text-muted underline underline-offset-2"
              >
                Limpar
              </button>
            )}
          </div>
          {retornarEm && (
            <p className="mt-1.5 text-xs text-muted">
              Vai aparecer na agenda desse dia e como aviso na tela inicial.
            </p>
          )}
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
