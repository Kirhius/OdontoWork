"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BotaoMicrofone, { temReconhecimentoDeVoz } from "@/components/BotaoMicrofone";
import CamposProcedimento, { FormProcedimento, novoForm } from "@/components/CamposProcedimento";
import {
  addPatient,
  addProcedimento,
  findPatientByName,
  getAllPatients,
  getClinicas,
  getPrecos,
  getProcedimentos,
  getUltimaClinicaId,
  setPatientArquivado,
  setUltimaClinicaId,
} from "@/lib/storage";
import { descreverTipoLocal, montarLocal } from "@/lib/local";
import { hojeISO } from "@/lib/data";
import { interpretarFala, pacientesParecidos } from "@/lib/voz";
import { Clinica, Patient } from "@/lib/types";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [form, setForm] = useState<FormProcedimento>(novoForm());
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [vocabulario, setVocabulario] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState("");
  const nomeRef = useRef<HTMLInputElement>(null);

  // Voz
  const [frase, setFrase] = useState("");
  const [vozDisponivel, setVozDisponivel] = useState<boolean | null>(null);
  const [erroVoz, setErroVoz] = useState("");
  const [avisos, setAvisos] = useState<string[]>([]);
  const [parecidos, setParecidos] = useState<Patient[]>([]);
  const [preenchido, setPreenchido] = useState(false);

  function carregarBase() {
    const nomesPrecos = getPrecos().map((p) => p.nome);
    setSugestoes(Array.from(new Set(nomesPrecos)));
    // Procedimentos que o app já conhece: tabela de valores + o que já foi lançado.
    setVocabulario(Array.from(new Set([...nomesPrecos, ...getProcedimentos().map((p) => p.nome)])));
    setPacientes(getAllPatients());
  }

  useEffect(() => {
    const lista = getClinicas();
    setClinicas(lista);
    carregarBase();
    setVozDisponivel(temReconhecimentoDeVoz());

    // Já abre com a data de hoje e a última clínica usada, para lançar mais rápido.
    const ultima = getUltimaClinicaId();
    setForm((f) => ({
      ...f,
      data: hojeISO(),
      clinicaId: lista.some((c) => c.id === ultima) ? ultima : "",
    }));
  }, []);

  // Preenche os campos com o que foi entendido. Não salva: quem salva é o botão Salvar.
  function interpretar(texto: string) {
    if (!texto.trim()) return;

    const r = interpretarFala(texto, { procedimentos: vocabulario, clinicas, pacientes });
    const lista = [...r.avisos];

    if (r.paciente) setNome(r.paciente);
    setParecidos(r.paciente ? pacientesParecidos(r.paciente, pacientes) : []);

    if (r.procedimento && !r.tipoLocal) {
      lista.push(`Local não falado: mantive "${descreverTipoLocal(form.tipoLocal)}".`);
    }

    setForm((f) => ({
      ...f,
      nome: r.procedimento || f.nome,
      tipoLocal: r.tipoLocal ?? f.tipoLocal,
      numeroDente: r.numeroDente ?? f.numeroDente,
      data: r.data ?? f.data,
      clinicaId: r.clinicaId ?? f.clinicaId,
    }));

    setAvisos(lista);
    setPreenchido(true);
  }

  function limparVoz() {
    setFrase("");
    setErroVoz("");
    setAvisos([]);
    setParecidos([]);
    setPreenchido(false);
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const existente = findPatientByName(nome);
    // Paciente arquivado que volta a ser atendido sai dos arquivados.
    const estavaArquivado = !!existente?.arquivado;
    if (existente && estavaArquivado) setPatientArquivado(existente.id, false);
    const paciente = existente ?? addPatient(nome);
    const temProcedimento = form.nome.trim().length > 0;

    if (temProcedimento) {
      const clinica = clinicas.find((c) => c.id === form.clinicaId);

      // O valor não é gravado aqui: o relatório busca na tabela da clínica (Configurações > Procedimentos).
      addProcedimento({
        patientId: paciente.id,
        nome: form.nome.trim(),
        local: montarLocal(form.tipoLocal, form.numeroDente),
        data: form.data || hojeISO(),
        clinicaId: clinica?.id,
        clinicaNome: clinica?.nome,
      });
    }

    setUltimaClinicaId(form.clinicaId);

    const base = existente
      ? `${paciente.nome} já estava cadastrado${estavaArquivado ? " e saiu dos arquivados" : ""}`
      : "Paciente cadastrado";
    setMensagem(temProcedimento ? `${base}. Procedimento lançado.` : `${base}.`);

    // Limpa só o que muda a cada paciente; clínica, local e data ficam para o próximo lançamento.
    setNome("");
    setForm((f) => ({ ...f, nome: "" }));
    limparVoz();
    carregarBase();
    nomeRef.current?.focus();
    setTimeout(() => setMensagem(""), 3000);
  }

  return (
    <div>
      <PageHeader title="Cadastro" backHref="/" />

      {/* Fora do <form> para que o Enter daqui só preencha os campos e nunca salve. */}
      <section className="rounded-xl2 border border-line bg-surface p-4 mb-6">
        <label htmlFor="frase" className="field-label">
          Falar ou digitar
        </label>
        <div className="flex items-center gap-2.5">
          <input
            id="frase"
            className="field-input"
            placeholder="Ex.: Paciente Marcelo restauração 25"
            value={frase}
            autoComplete="off"
            enterKeyHint="done"
            onChange={(e) => setFrase(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                interpretar(frase);
              }
            }}
          />
          {vozDisponivel && (
            <BotaoMicrofone
              onParcial={setFrase}
              onFinal={(texto) => {
                setFrase(texto);
                interpretar(texto);
              }}
              onErro={setErroVoz}
            />
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => interpretar(frase)}
            disabled={!frase.trim()}
            className="rounded-xl border border-line bg-bg px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Preencher campos
          </button>
          {(frase || preenchido) && (
            <button
              type="button"
              onClick={limparVoz}
              className="text-sm text-muted underline underline-offset-2"
            >
              Limpar
            </button>
          )}
        </div>

        {vozDisponivel === false && (
          <p className="text-xs text-muted mt-3">
            Este navegador não tem reconhecimento de voz. Use o microfone do teclado do celular
            neste campo e toque em Preencher campos.
          </p>
        )}
        {erroVoz && <p className="text-xs text-coral-ink mt-3">{erroVoz}</p>}

        {preenchido && (
          <p className="text-xs text-muted mt-3">
            Campos preenchidos abaixo. Confira e toque em Salvar para lançar.
          </p>
        )}
        {avisos.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1 rounded-lg bg-sand/50 px-3 py-2 text-xs text-sand-ink">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        {parecidos.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted mb-1.5">Já cadastrado com esse nome? Toque para usar:</p>
            <div className="flex flex-wrap gap-2">
              {parecidos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setNome(p.nome);
                    setParecidos([]);
                  }}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-medium"
                >
                  {p.nome}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <form onSubmit={handleSalvar} className="flex flex-col gap-5">
        <div>
          <label htmlFor="nome" className="field-label">
            Nome do paciente
          </label>
          <input
            id="nome"
            ref={nomeRef}
            className="field-input"
            placeholder="Ex.: Maria da Silva"
            list="pacientes-cadastrados"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <datalist id="pacientes-cadastrados">
            {pacientes.map((p) => (
              <option key={p.id} value={p.nome} />
            ))}
          </datalist>
        </div>

        <CamposProcedimento
          value={form}
          onChange={setForm}
          clinicas={clinicas}
          sugestoes={sugestoes}
        />

        <button type="submit" className="primary-btn" disabled={!nome.trim()}>
          Salvar
        </button>

        {mensagem && (
          <p className="text-sm text-mint-ink bg-mint/40 rounded-lg px-3 py-2 text-center">
            {mensagem}
          </p>
        )}

        <Link
          href="/pacientes"
          className="text-sm text-muted underline underline-offset-2 text-center"
        >
          Ver pacientes cadastrados
        </Link>
      </form>
    </div>
  );
}
