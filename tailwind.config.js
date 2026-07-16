/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ACSE brand palette (from the reference site)
        brand: {
          navy: "#0a1e35",
          navydeep: "#0d1b2a",
          cyan: "#2ca5d9",
          red: "#e33935",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "typing-bounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        // Sweeping highlight for the "thinking" status text.
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },

        // --- V1 "Filament" (immersive copilot) ---
        "aurora-drift": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(6%, -4%) scale(1.15)" },
        },
        "spine-draw": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        "orb-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        "filament-beam": {
          "0%": { transform: "translateY(-30%)", opacity: "0" },
          "40%": { opacity: "1" },
          "100%": { transform: "translateY(340%)", opacity: "0" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "row-reveal": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "digit-pop": {
          "0%": { opacity: "0", transform: "scale(0.7)" },
          "70%": { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "ring-out": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },

        // --- V2 "Waterline Concierge" (voice) ---
        "orb-ripple": {
          "0%": { transform: "scale(0.9)", opacity: "0.55" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        "wave-eq": {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        "speak-in": {
          from: { opacity: "0", clipPath: "inset(0 100% 0 0)" },
          to: { opacity: "1", clipPath: "inset(0 0 0 0)" },
        },
        "speak-in-right": {
          from: { opacity: "0", clipPath: "inset(0 0 0 100%)" },
          to: { opacity: "1", clipPath: "inset(0 0 0 0)" },
        },
        "caption-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sheen-rotate": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s ease-out both",
        "typing-bounce": "typing-bounce 1.2s infinite ease-in-out",
        shimmer: "shimmer 1.6s linear infinite",

        // V1 "Filament"
        "aurora-drift": "aurora-drift 24s ease-in-out infinite alternate",
        "spine-draw": "spine-draw 0.6s ease-out both",
        "orb-breathe": "orb-breathe 4.5s ease-in-out infinite",
        "filament-beam": "filament-beam 1.2s linear infinite",
        "rise-in": "rise-in 0.5s ease-out both",
        "row-reveal": "row-reveal 0.4s ease-out both",
        "digit-pop": "digit-pop 0.4s ease-out both",
        "ring-out": "ring-out 0.9s ease-out forwards",

        // V2 "Waterline Concierge"
        "orb-ripple": "orb-ripple 2.4s ease-out infinite",
        "wave-eq": "wave-eq 1s ease-in-out infinite",
        "speak-in": "speak-in 0.5s ease-out both",
        "speak-in-right": "speak-in-right 0.5s ease-out both",
        "caption-in": "caption-in 0.4s ease-out both",
        "sheen-rotate": "sheen-rotate 10s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
