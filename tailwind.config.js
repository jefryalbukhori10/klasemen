/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: '#0F3D2E',
          light: '#155C42',
          dark: '#0A2B20',
        },
        gold: {
          DEFAULT: '#D4A94B',
          light: '#E8C876',
          dark: '#A9812F',
        },
        chalk: '#F6F3EA',
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
