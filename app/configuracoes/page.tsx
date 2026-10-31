import Link from "next/link";
import { ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import IconeTom, { Tom } from "@/components/IconeTom";

const traco = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const ITENS: { href: string; titulo: string; texto: string; tom: Tom; icone: ReactNode }[] = [
  {
    href: "/configuracoes/procedimentos",
    titulo: "Procedimentos",
    texto: "Lista usada ao lançar um atendimento",
    tom: "a",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M9 6h11M9 12h11M9 18h11" {...traco} />
        <path d="M4 5.5l1.2 1.2L7 4.8M4 11.5l1.2 1.2L7 10.8M4 17.5l1.2 1.2L7 16.8" {...traco} />
      </svg>
    ),
  },
  {
    href: "/configuracoes/relatorios",
    titulo: "Relatórios",
    texto: "Por período, clínica ou procedimento",
    tom: "b",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" {...traco} />
        <path d="M14 3.5V8h4M8.5 17v-3M12 17v-6M15.5 17v-4" {...traco} />
      </svg>
    ),
  },
  {
    href: "/configuracoes/clinicas",
    titulo: "Clínicas",
    texto: "Nomes e cores de identificação",
    tom: "c",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 10h3a1 1 0 0 1 1 1v10M3.5 21h17" {...traco} />
        <path d="M8.5 8h3M8.5 12h3M8.5 16h3" {...traco} />
      </svg>
    ),
  },
  {
    href: "/configuracoes/limpeza",
    titulo: "Limpeza",
    texto: "Excluir pacientes para liberar espaço",
    tom: "d",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M5 7h14M10 7V5h4v2M7 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" {...traco} />
        <path d="M10.5 11v5M13.5 11v5" {...traco} />
      </svg>
    ),
  },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader title="Configurações" backHref="/" />
      <nav className="flex flex-col gap-3.5">
        {ITENS.map((i) => (
          <Link key={i.href} href={i.href} className="home-btn">
            <IconeTom tom={i.tom}>{i.icone}</IconeTom>
            <span>
              <span className="block font-display text-lg">{i.titulo}</span>
              <span className="block text-sm text-muted">{i.texto}</span>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
