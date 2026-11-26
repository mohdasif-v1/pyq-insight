/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep obsidian monochrome foundation with crisp borders
        slate: {
          950: "#090A0F",
          900: "#0E1117",
          850: "#131722",
          800: "#1A202E",
          750: "#222B3D",
          700: "#2D374D",
          600: "#4B5565",
          500: "#697586",
          400: "#9AA4B2",
          300: "#CDD5DF",
          200: "#E3E8EF",
          100: "#EEF2F6",
          50: "#F8FAFC",
        },
        // Electric Blue / High-End Tech Accent (Stripe/Linear caliber)
        accent: {
          DEFAULT: "#2563EB", // Rich electric cobalt
          hover: "#1D4ED8",
          glow: "rgba(37, 99, 235, 0.15)",
          subtle: "#1E293B",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        flat: "0 0 0 1px rgba(255, 255, 255, 0.08)",
        panel: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.07)",
        "panel-hover": "0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(37, 99, 235, 0.3)",
        glow: "0 0 30px -5px rgba(37, 99, 235, 0.25)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
