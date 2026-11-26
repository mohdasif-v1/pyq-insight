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
        // Official Academic SaaS Palette:
        // Deep Navy (#17153B) - Primary dark surfaces, backgrounds
        // Royal Indigo (#2E236C) - Primary interactive elements, active nav, primary buttons
        // Muted Indigo (#433D8B) - Secondary accents, selected states, highlights
        // Soft Lavender (#C8ACD6) - Subtle text accents, tags, highlights
        app: {
          bg: "#0F0E26",           // Root canvas: deep neutral navy (not pure black)
          surface: "#17153B",      // Primary surface: Deep Navy
          elevated: "#1F1B47",     // Elevated cards/panels: slightly lighter navy
          card: "#17153B",         // Main cards
          input: "#141233",        // Input fields: differentiated from surface
          border: "#292456",       // Subtle 1px dark indigo separator
          borderHover: "#3B3374",  // Subtle border hover
        },
        indigo: {
          deep: "#17153B",
          royal: "#2E236C",
          muted: "#433D8B",
          lavender: "#C8ACD6",
        },
        // Functional typography tokens
        text: {
          primary: "#F5F3F8",     // Soft off-white
          secondary: "#B8B2D1",   // Muted grey-lavender
          muted: "#7A739E",       // Readable neutral muted
        },
        // Functional state accents (restrained, low saturation)
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
      },
      boxShadow: {
        none: "none",
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        popover: "0 4px 16px -2px rgba(15, 14, 38, 0.6)",
      },
    },
  },
  plugins: [],
};
