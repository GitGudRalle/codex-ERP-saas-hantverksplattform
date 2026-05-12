import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        line: "#d7ded8",
        field: "#f5f7f4",
        action: "#0f766e",
        warning: "#b45309",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(23, 33, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
