/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FFF8EE', 100: '#FFF3E2', 200: '#F9E6CC', 300: '#F0D4AE' },
        cocoa: { DEFAULT: '#4A2E22', 700: '#5E3B2B', 500: '#8A6553', 300: '#B89A8B' },
        terra: { DEFAULT: '#B5553A', 600: '#9C4630', 400: '#D2785C', 100: '#F8E1D8' },
        coral: { DEFAULT: '#E4555F', 600: '#C9404A', 100: '#FDE3E4' },
        sage: { DEFAULT: '#4F8A65', 600: '#3F7353', 100: '#E1EFE5' },
        honey: { DEFAULT: '#E9A23B', 100: '#FBEFD9' },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 6px 20px -6px rgba(74,46,34,.18)',
        card: '0 18px 40px -14px rgba(74,46,34,.35)',
      },
    },
  },
  plugins: [],
};
