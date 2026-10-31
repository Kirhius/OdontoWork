import type { Config } from "tailwindcss";

// As cores vêm das variáveis CSS em app/globals.css (bloco :root).
const cor = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: cor("bg"),
        surface: cor("surface"),
        ink: cor("ink"),
        muted: cor("muted"),
        line: cor("line"),
        accent: { DEFAULT: cor("accent"), ink: cor("accent-ink") },
        danger: { DEFAULT: cor("danger"), ink: cor("danger-ink") },
        paid: { DEFAULT: cor("paid"), ink: cor("paid-ink") },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
export default config;
