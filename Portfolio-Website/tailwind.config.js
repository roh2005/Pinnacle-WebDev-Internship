/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6", // Teal 500
        secondary: "#0f766e", // Teal 700
        dark: "#0f172a", // Slate 900
        light: "#f8fafc", // Slate 50
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
