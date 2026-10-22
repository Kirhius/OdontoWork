"use client";

import Link from "next/link";
import { Clinica, TipoLocal } from "@/lib/types";
import { DENTES_FDI } from "@/lib/local";

export interface FormProcedimento {
  clinicaId: string;
  nome: string;
  tipoLocal: TipoLocal;
  numeroDente: string;
  data: string;
}

export function novoForm(data = ""): FormProcedimento {
  return {
    clinicaId: "",
    nome: "",
    tipoLocal: "boca_toda",
    numeroDente: DENTES_FDI[0],
    data,
  };
}

interface Props {
  value: FormProcedimento;
  onChange: (value: FormProcedimento) => void;
  clinicas: Clinica[];
  sugestoes: string[];
}

export default function CamposProcedimento({ value, onChange, clinicas, sugestoes }: Props) {
  function set(parcial: Partial<FormProcedimento>) {
    onChange({ ...value, ...parcial });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="field-label">Clínica</label>
        {clinicas.length === 0 ? (
          <p className="text-xs text-muted">
            Nenhuma clínica cadastrada.{" "}
            <Link href="/configuracoes/adicionais/clinicas" className="underline underline-offset-2">
              Cadastrar clínicas
            </Link>
          </p>
        ) : (
          <select
            className="field-input"
            value={value.clinicaId}
            onChange={(e) => set({ clinicaId: e.target.value })}
          >
            <option value="">Sem clínica</option>
            {clinicas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="field-label">Procedimento</label>
        <input
          className="field-input"
          placeholder="Ex.: Restauração, Limpeza..."
          list="sugestoes-procedimentos"
          value={value.nome}
          onChange={(e) => set({ nome: e.target.value })}
        />
        <datalist id="sugestoes-procedimentos">
          {sugestoes.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Local</label>
          <select
            className="field-input"
            value={value.tipoLocal}
            onChange={(e) => set({ tipoLocal: e.target.value as TipoLocal })}
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
            value={value.data}
            onChange={(e) => set({ data: e.target.value })}
          />
        </div>
      </div>

      {value.tipoLocal === "dente" && (
        <div>
          <label className="field-label">Número do dente (FDI)</label>
          <select
            className="field-input"
            value={value.numeroDente}
            onChange={(e) => set({ numeroDente: e.target.value })}
          >
            {DENTES_FDI.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
