/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Wide, geometric display face for the wordmark and headings
        display: ['"Unbounded Variable"', "system-ui", "sans-serif"],
        // Clean, slightly technical text face for everything else
        sans: ['"Instrument Sans Variable"', "system-ui", "sans-serif"],
      },
      colors: {
        /* Cream taken from the knob caps on the JUNO.1 3D model: the one accent colour */
        cap: "#E8DFA0",
        gray: {
          DEFAULT: "#86868b",
          100: "#a1a1a6",
          200: "#c7c7cc",
          300: "#2a2a2d",
        },
        surface: "#101010",
        line: "#26262a",
      },
    },
  },
  plugins: [],
};
