import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ArquivadosPage() {
  return (
    <div>
      <PageHeader title="Arquivados" backHref="/configuracoes" />

      <nav className="flex flex-col gap-4">
        <Link href="/configuracoes/arquivados/pacientes" className="home-btn bg-blue text-blue-ink">
          <IconPacientes />
          <span className="font-display text-lg">Pacientes</span>
        </Link>

        <Link href="/configuracoes/arquivados/pagamentos" className="home-btn bg-mint text-mint-ink">
          <IconPagamentos />
          <span className="font-display text-lg">Pagamentos</span>
        </Link>
      </nav>
    </div>
  );
}

function IconPacientes() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 20c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15.2 13c2 .1 3.8 1.6 4.3 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconPagamentos() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v8M14.3 9.8c0-.9-1-1.6-2.3-1.6-1.4 0-2.4.8-2.4 1.8 0 2.6 4.7 1.3 4.7 3.9 0 1-1 1.8-2.4 1.8-1.3 0-2.3-.7-2.3-1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
