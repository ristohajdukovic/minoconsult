/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F6F5F2',
        forest: '#0A1C1A',
        rose: '#B86A64',
        'rose-light': '#F4E5E3',
        taupe: '#DCD8CE',
        ink: '#0A1C1A',
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(10, 28, 26, 0.10)',
      },
    },
  },
  plugins: [],
};
