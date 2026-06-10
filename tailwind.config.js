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
            950: '#060d18',
        },
        obsidian: {
            DEFAULT: '#12110f',
            light: '#1c1a17',
            dark: '#0a0908',
            muted: '#262420'
        },
        gold: {
            DEFAULT: '#C5A880',
            light: '#e5c199',
            dark: '#9a7e58',
            pale: '#f5ebdf',
            glow: 'rgba(197, 168, 128, 0.15)',
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
        serif: ['Cormorant Garamond', 'serif'],
      }
    },
  },
  plugins: [],
}
