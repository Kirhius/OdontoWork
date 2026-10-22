import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader title="Configurações" backHref="/" />

      <nav className="flex flex-col gap-4">
        <Link href="/configuracoes/procedimentos" className="home-btn bg-mint text-mint-ink">
          <IconProcedimentos />
          <span className="font-display text-lg">Procedimentos</span>
        </Link>

        <Link href="/configuracoes/relatorios" className="home-btn bg-blue text-blue-ink">
          <IconRelatorios />
          <span className="font-display text-lg">Relatórios</span>
        </Link>

        <Link href="/configuracoes/financeiro" className="home-btn bg-lilac text-lilac-ink">
          <IconFinanceiro />
          <span className="font-display text-lg">Financeiro</span>
        </Link>

        <Link href="/configuracoes/adicionais" className="home-btn bg-coral text-coral-ink">
          <IconAdicionais />
          <span className="font-display text-lg">Adicionais</span>
        </Link>
      </nav>
    </div>
  );
}

function IconProcedimentos() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M8 5.5h6.5L19 10v8.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.3 5.5V10H19" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 13.2h5M9.5 16h3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
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

function IconAdicionais() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.5 13.5v6M13.5 16.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
