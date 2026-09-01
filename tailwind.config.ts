import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ice: {
          50: "#f2f8fb",
          100: "#e4f1f7",
          200: "#c3e2ef",
          300: "#8fcbe2",
          400: "#53afd1",
          500: "#2d93bb",
          600: "#1f759d",
          700: "#1b5e80",
          800: "#1c506a",
          900: "#1b435a",
        },
        carbon: {
          950: "#08090a",
          900: "#0d0f11",
          850: "#131619",
          800: "#1a1e22",
          700: "#262b31",
          600: "#3a4047",
          500: "#5c646d",
          400: "#8b939c",
          300: "#b4bcc4",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 6s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
