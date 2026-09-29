"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 mb-6">
      <Link
        href={backHref}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-line text-ink shrink-0"
        aria-label="Voltar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <h1 className="font-display text-xl text-ink flex-1">{title}</h1>
      {action}
    </header>
  );
}
