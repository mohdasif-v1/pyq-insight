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
        dark: {
          bg: "#0B0D12",
          secondary: "#10141C",
          card: "#151A23",
          surface: "#1B2230",
          border: "#283142",
          "border-subtle": "#1E2634",
        },
        brand: {
          primary: "#8B9CF6",
          accent: "#83B5C9",
          hover: "#7C8EE5",
          muted: "rgba(139, 156, 246, 0.12)",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#707C90",
          600: "#A0AABC",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        status: {
          success: "#78B99A",
          "success-muted": "rgba(120, 185, 154, 0.12)",
          warning: "#D6B779",
          "warning-muted": "rgba(214, 183, 121, 0.12)",
          error: "#D98585",
          "error-muted": "rgba(217, 133, 133, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        card: "0 4px 12px 0 rgba(0, 0, 0, 0.35)",
        elevated: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
