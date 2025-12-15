import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D4A84B",
          light: "#E8C877",
          dark: "#B8923D",
        },
        background: {
          app: "#0A0A0A",
          card: "#141414",
          secondary: "#1A1A1A",
          elevated: "#1E1E1E",
          hover: "#252525",
        },
        border: {
          DEFAULT: "#2A2A2A",
          subtle: "#1F1F1F",
          strong: "#3A3A3A",
          accent: "rgba(212, 168, 75, 0.3)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0A0",
          muted: "#6B6B6B",
          accent: "#D4A84B",
        },
        status: {
          success: "#22C55E",
          successLight: "rgba(34, 197, 94, 0.15)",
          error: "#EF4444",
          errorLight: "rgba(239, 68, 68, 0.15)",
          warning: "#F59E0B",
          warningLight: "rgba(245, 158, 11, 0.15)",
          info: "#3B82F6",
          infoLight: "rgba(59, 130, 246, 0.15)",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'SF Mono'", "'Fira Code'", "'Consolas'", "monospace"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        display: "3.5rem",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.4)",
        "card-elevated": "0 12px 40px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(212, 168, 75, 0.3)",
        "glow-strong": "0 0 40px rgba(212, 168, 75, 0.4)",
        "button-primary": "0 4px 12px rgba(212, 168, 75, 0.3)",
        "button-primary-hover": "0 6px 20px rgba(212, 168, 75, 0.4)",
      },
      spacing: {
        "header": "72px",
        "sidebar": "240px",
        "sidebar-collapsed": "72px",
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out forwards",
        slideUp: "slideUp 0.3s ease-out forwards",
        scaleIn: "scaleIn 0.2s ease-out forwards",
        pulse: "pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        glow: "glow 2s ease-in-out infinite",
        chartGrow: "chartGrow 0.6s ease-out forwards",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
    },
  },
  plugins: [],
};
export default config;
