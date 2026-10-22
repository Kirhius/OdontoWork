import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function AdicionaisPage() {
  return (
    <div>
      <PageHeader title="Adicionais" backHref="/configuracoes" />

      <nav className="flex flex-col gap-4">
        <Link href="/configuracoes/adicionais/clinicas" className="home-btn bg-coral text-coral-ink">
          <IconClinicas />
          <span className="font-display text-lg">Clínicas</span>
        </Link>
      </nav>
    </div>
  );
}

function IconClinicas() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M5 20V8.5l7-4 7 4V20" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3.5 20h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 10.5v5M9.5 13h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
