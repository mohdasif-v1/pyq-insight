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
        // Creative Director Palette:
        // Deep Midnight Navy, Rich Violet, Muted Lavender, Cool Cyan & Electric Blue accents
        canvas: {
          base: "#0A0915",
          deep: "#0F0D20",
          surface: "rgba(23, 21, 59, 0.65)",
          elevated: "rgba(31, 27, 71, 0.75)",
          border: "rgba(200, 172, 214, 0.12)",
          borderHover: "rgba(200, 172, 214, 0.28)",
          glass: "rgba(15, 13, 32, 0.72)",
        },
        brand: {
          navy: "#17153B",
          royal: "#2E236C",
          muted: "#433D8B",
          lavender: "#C8ACD6",
          cyan: "#38BDF8",
          violet: "#8B5CF6",
        },
        ink: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#847F9D",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "Menlo",
          "monospace",
        ],
      },
      backgroundImage: {
        "radial-hero": "radial-gradient(circle at 50% 0%, rgba(67, 61, 139, 0.35) 0%, rgba(46, 35, 108, 0.15) 45%, rgba(10, 9, 21, 0) 70%)",
        "mesh-glow": "radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.18) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(56, 189, 248, 0.12) 0px, transparent 50%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(200, 172, 214, 0.15)",
        "glass-hover": "0 14px 40px -4px rgba(46, 35, 108, 0.45), inset 0 1px 0 0 rgba(200, 172, 214, 0.3)",
        glow: "0 0 35px -5px rgba(67, 61, 139, 0.5)",
        cta: "0 10px 25px -5px rgba(46, 35, 108, 0.5), inset 0 1px 0 0 rgba(200, 172, 214, 0.3)",
      },
    },
  },
  plugins: [],
};
