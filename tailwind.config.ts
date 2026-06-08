import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0E0F12",
          700: "#2A2C33",
          500: "#5A5E68",
          300: "#9AA0AC",
          100: "#E8EAEF",
        },
        paper: {
          DEFAULT: "#ffffff",
          warm: "#EFEBE4",
          cream: "#ffffff",
        },
        juni: {
          DEFAULT: "#5B4FE9",
          soft: "#EEEBFE",
          ink: "#2A2487",
          mint: "#B8E4D2",
          peach: "#F5C6A5",
          rose: "#E8B4C0",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,15,18,0.04), 0 8px 24px rgba(14,15,18,0.06)",
        sheet: "0 -10px 30px rgba(14,15,18,0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        "shimmer": "shimmer 1.6s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-up": "slide-up 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "fade-in": "fade-in 0.22s ease-out both",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
