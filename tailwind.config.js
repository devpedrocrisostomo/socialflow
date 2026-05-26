/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        primary: {
          50: '#f4f6fb',
          100: '#e8ecf6',
          200: '#c5d0ec',
          300: '#9cb1e0',
          400: '#6d8cd1',
          500: '#4f70c6',
          600: '#3d56aa',
          700: '#31448b',
          800: '#26346d',
          900: '#1d2653',
          950: '#0c0f25',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
