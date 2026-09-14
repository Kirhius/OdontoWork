import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader title="Configurações" backHref="/" />

      <nav className="flex flex-col gap-4">
        <Link href="/configuracoes/relatorios" className="home-btn bg-blue text-blue-ink">
          <IconRelatorios />
          <span className="font-display text-lg">Relatórios</span>
        </Link>

        <Link href="/configuracoes/financeiro" className="home-btn bg-lilac text-lilac-ink">
          <IconFinanceiro />
          <span className="font-display text-lg">Financeiro</span>
        </Link>
      </nav>
    </div>
  );
}

function IconRelatorios() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconFinanceiro() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v8M14.3 9.8c0-.9-1-1.6-2.3-1.6-1.4 0-2.4.8-2.4 1.8 0 2.6 4.7 1.3 4.7 3.9 0 1-1 1.8-2.4 1.8-1.3 0-2.3-.7-2.3-1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
