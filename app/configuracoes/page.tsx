import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const ITENS = [
  { href: "/configuracoes/procedimentos", titulo: "Procedimentos", texto: "Lista usada ao lançar um atendimento" },
  { href: "/configuracoes/relatorios", titulo: "Relatórios", texto: "Por período, clínica ou procedimento" },
  { href: "/configuracoes/clinicas", titulo: "Clínicas", texto: "Nomes e cores de identificação" },
  { href: "/configuracoes/limpeza", titulo: "Limpeza", texto: "Excluir pacientes para liberar espaço" },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader title="Configurações" backHref="/" />
      <nav className="flex flex-col gap-3.5">
        {ITENS.map((i) => (
          <Link key={i.href} href={i.href} className="home-btn">
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
