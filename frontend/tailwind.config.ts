/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",  // Primary accent
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",  // Secondary accent
        },
        surface: {
          900: "#0f0f13",
          800: "#18181f",
          700: "#1f1f2a",
          600: "#272735",
          500: "#32324a",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
        "gradient-dark":  "linear-gradient(180deg, #0f0f13 0%, #18181f 100%)",
      },
      boxShadow: {
        glow:       "0 0 20px rgba(124, 58, 237, 0.4)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
        glass:      "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-in":   "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
