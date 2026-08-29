/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F2",
        paper: "#F7F2EC",
        ink: "#2A211C",
        espresso: "#3A2A20",
        blush: "#EFD3CE",
        clay: "#C98F7B",
        rose: "#D98E8A",
        sand: "#D8C6AE",
        line: "#E7DFD4",
        muted: "#8A7C6E",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        body: ["'Manrope'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
