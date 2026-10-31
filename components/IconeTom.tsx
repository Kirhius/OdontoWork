import { ReactNode } from "react";

export type Tom = "a" | "b" | "c" | "d";

// Classes completas (e não montadas por texto) para o Tailwind enxergar cada uma.
const CLASSES: Record<Tom, string> = {
  a: "bg-tone-a text-tone-a-ink",
  b: "bg-tone-b text-tone-b-ink",
  c: "bg-tone-c text-tone-c-ink",
  d: "bg-tone-d text-tone-d-ink",
};

// Quadrado colorido que leva o ícone dos botões. As cores ficam em app/globals.css (--tone-*).
export default function IconeTom({ tom, children }: { tom: Tom; children: ReactNode }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${CLASSES[tom]}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
