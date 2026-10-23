import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        surface: "#FFFFFF",
        ink: "#2B2E33",
        muted: "#767B85",
        line: "#E7E2D8",
        mint: { DEFAULT: "#A9DED2", ink: "#1F4A40" },
        blue: { DEFAULT: "#AECBEA", ink: "#1E3A5C" },
        lilac: { DEFAULT: "#CBB9E8", ink: "#3E2E58" },
        coral: { DEFAULT: "#F0AFA4", ink: "#6B2A21" },
        sand: { DEFAULT: "#EBDDB8", ink: "#59491F" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
