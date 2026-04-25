/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        surface: "#0c1324",
        "surface-lowest": "#070d1f",
        "surface-container-lowest": "#070d1f",
        "surface-container-low": "#111827",
        "surface-container": "#191f31",
        "surface-container-high": "#23293c",
        "surface-container-highest": "#363f58",
        "surface-variant": "#191f31",
        "primary-container": "#06b6d4",
        primary: "#06b6d4",
        "on-surface": "#dce1fb",
        "on-surface-variant": "#94a3b8",
        "on-primary": "#e0e7ff",
        "outline-variant": "#464555",
      },
      boxShadow: {
        ambient: "0 0 40px 10px rgba(6, 182, 212, 0.15)",
        glow: "0 0 24px rgba(6, 182, 212, 0.35)",
        "glow-sm": "0 0 12px rgba(6, 182, 212, 0.25)",
        "glow-lg": "0 0 48px rgba(6, 182, 212, 0.25)",
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-sm": "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-hover": "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(6,182,212,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      letterSpacing: {
        tighter: '-0.02em',
        widest: '0.05em',
      },
      animation: {
        "float-slow": "floatSlow 8s ease-in-out infinite",
        "float-medium": "floatMedium 6s ease-in-out infinite",
        "float-fast": "floatFast 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-20px) translateX(10px)" },
          "66%": { transform: "translateY(10px) translateX(-10px)" },
        },
        floatMedium: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-15px) translateX(15px)" },
        },
        floatFast: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backdropBlur: {
        xs: "4px",
        "4xl": "72px",
      },
    },
  },
  plugins: [],
}
