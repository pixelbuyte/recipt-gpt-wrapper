import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        ink: "#0B0B0F",
        muted: "#6B7280",
        border: "#E5E7EB",
        accent: "#6366F1",
        "accent-50": "#EEF2FF",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "12px" },
      boxShadow: { card: "0 1px 2px rgba(0,0,0,.04)" },
    },
  },
  plugins: [],
};
export default config;
