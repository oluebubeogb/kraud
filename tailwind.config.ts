import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { navy: { DEFAULT: "#002454", 700: "#0A3270", 50: "#E8EDF5" }, teal: { DEFAULT: "#1F7A72", 50: "#E6F2F1" }, silver: { DEFAULT: "#8A9199", 200: "#E3E6EA" }, paper: "#F7F8FA", coral: "#FC849C", gold: "#FCC06C", peach: "#FCA884", cyan: "#30909C", mint: "#249C84", sky: "#4878B4", violet: { DEFAULT: "#606CCC", 2: "#7860E4" }, rose: "#FC6CB4" },
    fontFamily: { sans: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    boxShadow: { card: "0 1px 2px rgba(0,36,84,.06), 0 4px 16px rgba(0,36,84,.06)", lift: "0 8px 30px rgba(0,36,84,.14)" },
  } },
} satisfies Config;
