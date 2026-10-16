/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFB347",
        "primary-dark": "#E59E3F",
        accent: "#FFE9B5",
        bg: "#FFF9E3",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      }
    },
  },
  plugins: [],
}
