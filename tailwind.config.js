/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./hadir.html",
    "./laporan.html",
    "./pembangunan.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
            50: '#f4f6f9',
            100: '#e3e8f1',
            200: '#cbd4e1',
            300: '#a7b8cd',
            400: '#7c97b5',
            500: '#5a789c',
            600: '#455e80',
            700: '#384d69',
            800: '#314157',
            900: '#0b1a30',
        },
        gold: {
            50: '#fdf9ed',
            100: '#faefcf',
            200: '#f4dc96',
            300: '#ecc457',
            400: '#e8b135',
            500: '#e7ae30',
            600: '#c98e21',
            700: '#a16a1c',
            800: '#84531d',
            900: '#6d431c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
