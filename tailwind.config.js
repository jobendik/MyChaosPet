/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      opacity: {
        7: '0.07',
        8: '0.08',
        12: '0.12',
        18: '0.18',
        35: '0.35',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
    },
  },
  plugins: [],
};
