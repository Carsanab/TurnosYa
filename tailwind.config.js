/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#BA5A5A',
          yellow: '#F7E49B',
          green: '#A4CE8B',
          teal: '#86BCBD',
        }
      }
    },
  },
  plugins: [],
}