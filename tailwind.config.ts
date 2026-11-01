import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { navy: { DEFAULT: "#002454", 700: "#0A3270", 50: "#E8EDF5" }, teal: { DEFAULT: "#1F7A72", 50: "#E6F2F1" }, silver: { DEFAULT: "#8A9199", 200: "#E3E6EA" }, paper: "#F7F8FA" },
    fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    boxShadow: { card: "0 1px 2px rgba(0,36,84,.06), 0 4px 16px rgba(0,36,84,.06)", lift: "0 8px 30px rgba(0,36,84,.14)" },
  } },
} satisfies Config;
