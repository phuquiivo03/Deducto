import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        paper: "#F6F1E7",
        card: "#FFFFFF",
        ink: "#2B2925",
        soft: "#6B6459",
        line: "#E6DDC9",
        gold: "#B8862B",
        goldBg: "#FBF0D9",
        green: "#4C8B6E",
        greenBg: "#E6F3EC",
        red: "#C4675B",
        redBg: "#FBEAE7",
      },

      boxShadow: {
        card: "0 2px 10px rgba(43,41,37,.06),0 1px 2px rgba(43,41,37,.05)",
      },

      fontFamily: {
        sans: ['var(--font-playwrite-vn)', 'cursive', 'sans-serif'],
        display: ['var(--font-momo-trust-display)', 'sans-serif'],
        serif: ['var(--font-momo-trust-display)', 'sans-serif'],
      },

      borderRadius: {
        card: "16px",
      },
      text: {
        xl: "15px",
        ssm: "13px",
      },
    },
  },

  plugins: [],
};

export default config;
