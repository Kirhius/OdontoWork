"use client";

import { useState } from "react";

export default function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onConfirm}
          className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-danger text-danger-ink"
        >
          Confirmar
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-muted"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      aria-label="Excluir"
      className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:bg-danger/30 hover:text-danger-ink shrink-0"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7h12Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
