/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Outfit'", "sans-serif"],
        body: ["'Figtree'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        background: {
          primary: "#FDFBF7",
          secondary: "#FFFFFF",
          tertiary: "#F3F4F6",
        },
        text: {
          primary: "#111827",
          secondary: "#4B5563",
          muted: "#9CA3AF",
          inverse: "#FFFFFF",
        },
        brand: {
          primary: "#A78BFA",
          primaryHover: "#8B5CF6",
          secondary: "#FDBA74",
          tertiary: "#93C5FD",
        },
        accents: {
          success: "#86EFAC",
          successBorder: "#166534",
          error: "#FCA5A5",
          errorBorder: "#991B1B",
          warning: "#FDE047",
          highlight: "#FFDE59",
        },
        borders: {
          default: "#111827",
          light: "#D1D5DB",
        },
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #111827',
        'brutal': '4px 4px 0px 0px #111827',
        'brutal-lg': '6px 6px 0px 0px #111827',
        'brutal-xl': '8px 8px 0px 0px #111827',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};