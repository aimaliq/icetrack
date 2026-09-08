import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens, driven by CSS variables in globals.css.
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        sunken: "rgb(var(--sunken) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        money: "rgb(var(--money) / <alpha-value>)",
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
        // Wordmark only — loaded by next/font in the root layout.
        wordmark: ["var(--font-wordmark)", "Segoe UI", "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.045em" },
      // Emil Kowalski's curves — see the Motion section in CLAUDE.md.
      transitionTimingFunction: {
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        // The list is rendered twice, so translating by half its height and
        // resetting lands on an identical frame — the loop is seamless.
        marquee: "marquee 42s linear infinite",
        // A reaction is rare enough to be worth a moment of delight.
        pop: "pop 320ms cubic-bezier(0.23, 1, 0.32, 1)",
        "float-up": "floatUp 700ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
        // The game's reveal: the winner jumps, the loser flinches. Rare
        // enough — once a round — to be worth the movement.
        win: "win 420ms cubic-bezier(0.23, 1, 0.32, 1)",
        lose: "lose 320ms cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        // The streak catching: a hard kick out, then a settle.
        "streak-up": "streakUp 500ms cubic-bezier(0.23, 1, 0.32, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        win: {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.035)" },
          "100%": { transform: "scale(1)" },
        },
        streakUp: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.45)" },
          "55%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" },
        },
        lose: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        // The emoji that lifts away from the button as it is counted.
        floatUp: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.9" },
          "100%": { transform: "translateY(-28px) scale(1.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
