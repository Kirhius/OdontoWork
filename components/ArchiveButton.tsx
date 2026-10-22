"use client";

export default function ArchiveButton({
  arquivado,
  onClick,
}: {
  arquivado: boolean;
  onClick: () => void;
}) {
  const rotulo = arquivado ? "Desarquivar" : "Arquivar";

  return (
    <button
      onClick={onClick}
      aria-label={rotulo}
      title={rotulo}
      className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:bg-blue/40 hover:text-blue-ink shrink-0"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3.5" y="5" width="17" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path
          d="M5 9.5V18a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V9.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {arquivado ? (
          <path
            d="M12 17v-5m0 0-2 2m2-2 2 2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path d="M10 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
