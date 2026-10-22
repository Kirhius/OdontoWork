"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CamposProcedimento, { FormProcedimento, novoForm } from "@/components/CamposProcedimento";
import {
  addPatient,
  addProcedimento,
  findPatientByName,
  getClinicas,
  getPreco,
  getPrecos,
  getUltimaClinicaId,
  setUltimaClinicaId,
} from "@/lib/storage";
import { montarLocal } from "@/lib/local";
import { hojeISO } from "@/lib/data";
import { Clinica } from "@/lib/types";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [form, setForm] = useState<FormProcedimento>(novoForm());
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState("");
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lista = getClinicas();
    setClinicas(lista);
    setSugestoes(Array.from(new Set(getPrecos().map((p) => p.nome))));

    // Já abre com a data de hoje e a última clínica usada, para lançar mais rápido.
    const ultima = getUltimaClinicaId();
    setForm((f) => ({
      ...f,
      data: hojeISO(),
      clinicaId: lista.some((c) => c.id === ultima) ? ultima : "",
    }));
  }, []);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const existente = findPatientByName(nome);
    const paciente = existente ?? addPatient(nome);
    const temProcedimento = form.nome.trim().length > 0;

    if (temProcedimento) {
      const clinica = clinicas.find((c) => c.id === form.clinicaId);
      // O valor vem da tabela de preços (Configurações > Procedimentos) e não aparece aqui.
      const preco = getPreco(form.nome, form.tipoLocal);

      addProcedimento({
        patientId: paciente.id,
        nome: form.nome.trim(),
        local: montarLocal(form.tipoLocal, form.numeroDente),
        data: form.data || hojeISO(),
        valor: preco?.valor,
        clinicaId: clinica?.id,
        clinicaNome: clinica?.nome,
      });
    }

    setUltimaClinicaId(form.clinicaId);

    if (existente) {
      setMensagem(
        temProcedimento
          ? `Procedimento lançado para ${paciente.nome}, que já estava cadastrado.`
          : `${paciente.nome} já estava cadastrado.`
      );
    } else {
      setMensagem(
        temProcedimento ? "Paciente cadastrado e procedimento lançado." : "Paciente cadastrado."
      );
    }

    // Limpa só o que muda a cada paciente; clínica, local e data ficam para o próximo lançamento.
    setNome("");
    setForm((f) => ({ ...f, nome: "" }));
    nomeRef.current?.focus();
    setTimeout(() => setMensagem(""), 3000);
  }

  return (
    <div>
      <PageHeader title="Cadastro" backHref="/" />

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
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
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
