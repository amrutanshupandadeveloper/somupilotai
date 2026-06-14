/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111827",
        accent: "#38bdf8",
        muted: "#94a3b8",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(56, 189, 248, 0.18)",
      },
    },
  },
  plugins: [],
};

