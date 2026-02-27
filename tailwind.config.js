/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Blue for primary actions/highlights
        "background-light": "#F3F4F6", // Light gray background
        "background-dark": "#111827", // Very dark gray/almost black for dark mode
        "panel-light": "#FFFFFF",
        "panel-dark": "#1F2937",
        "text-primary-light": "#111827",
        "text-primary-dark": "#F9FAFB",
        "text-secondary-light": "#6B7280",
        "text-secondary-dark": "#9CA3AF",
        "accent-neon": "#0EA5E9", // Cyan neon for dark mode accents
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', '.light &')
    })
  ],
}
