import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10">
        <Logo size={44} />
        <div>
          <h1 className="font-display text-2xl leading-tight text-ink">OdontoWork</h1>
          <p className="text-sm text-muted">Seu controle de atendimentos</p>
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        <Link href="/cadastro" className="home-btn bg-mint text-mint-ink">
          <IconCadastro />
          <span className="font-display text-lg">Cadastro</span>
        </Link>

        <Link href="/pacientes" className="home-btn bg-blue text-blue-ink">
          <IconPacientes />
          <span className="font-display text-lg">Pacientes</span>
        </Link>

        <Link href="/configuracoes" className="home-btn bg-lilac text-lilac-ink">
          <IconConfig />
          <span className="font-display text-lg">Configurações</span>
        </Link>
      </nav>
    </div>
  );
}

function IconCadastro() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 20c1-3.6 3.8-5.5 6.5-5.5s5.5 1.9 6.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18.5 6.5v4M16.5 8.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
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

function IconConfig() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 4.5v1.6M12 17.9v1.6M19.5 12h-1.6M6.1 12H4.5M17.3 6.7l-1.1 1.1M7.8 16.2l-1.1 1.1M17.3 17.3l-1.1-1.1M7.8 7.8 6.7 6.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
