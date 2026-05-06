import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        signal: "rgb(var(--color-signal) / <alpha-value>)",
        steel: "rgb(var(--color-steel) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)"
      }
    }
  },
  plugins: []
};

export default config;
