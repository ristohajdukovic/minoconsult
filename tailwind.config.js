/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#deece6',
        forest: '#0A1C1A',
        rose: '#B86A64',
        'rose-light': '#F4E5E3',
        taupe: '#DCD8CE',
        ink: '#0A1C1A',
      },
      fontFamily: {
        sans: ['Figtree', '"Segoe UI"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Abhaya Libre"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(10, 28, 26, 0.10)',
      },
    },
  },
  plugins: [],
};
