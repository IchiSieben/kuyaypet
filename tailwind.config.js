/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FFF8EE', 50: '#FFFCF7', 100: '#FFF3E2', 200: '#F9E6CC', 300: '#F0D4AE' },
        cocoa: { DEFAULT: '#4A2E22', 900: '#2E1A12', 700: '#5E3B2B', 500: '#8A6553', 400: '#A4826F', 300: '#B89A8B', 200: '#D9C7BC' },
        terra: { DEFAULT: '#B5553A', 600: '#9C4630', 400: '#D2785C', 300: '#E39A82', 100: '#F8E1D8', 50: '#FCF1EC' },
        coral: { DEFAULT: '#E4555F', 600: '#C9404A', 100: '#FDE3E4' },
        sage: { DEFAULT: '#4F8A65', 600: '#3F7353', 100: '#E1EFE5' },
        honey: { DEFAULT: '#E9A23B', 600: '#C98621', 100: '#FBEFD9' },
        // Surface tiers: a layered, translucent system instead of flat tinted boxes.
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          line: 'var(--surface-line)',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      fontSize: {
        // Type scale ~1.2 (minor third) tuned for a 390px phone.
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        xs: ['0.75rem', { lineHeight: '1.05rem' }],
        sm: ['0.875rem', { lineHeight: '1.3rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.6rem' }],
        xl: ['1.3125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }],
        '2xl': ['1.5625rem', { lineHeight: '1.95rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.2rem', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        'safe-t': 'max(env(safe-area-inset-top), 14px)',
        'safe-b': 'max(env(safe-area-inset-bottom), 8px)',
      },
      borderRadius: {
        // Radius scale: controls (xl) → cards (3xl) → sheets/phone (4xl, 5xl)
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.625rem',
      },
      boxShadow: {
        // Elevation: cocoa-tinted, two-layer shadows (contact + ambient) so depth reads as warm, not grey.
        hairline: '0 0 0 1px rgba(74,46,34,.06)',
        soft: '0 1px 2px rgba(74,46,34,.06), 0 6px 20px -6px rgba(74,46,34,.16)',
        raised: '0 1px 2px rgba(74,46,34,.08), 0 10px 28px -8px rgba(74,46,34,.22)',
        card: '0 2px 4px rgba(74,46,34,.08), 0 18px 40px -14px rgba(74,46,34,.35)',
        float: '0 4px 10px rgba(74,46,34,.10), 0 28px 60px -18px rgba(74,46,34,.40)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(74,46,34,.05)',
        glow: '0 0 0 4px rgba(181,85,58,.18)',
        'glow-coral': '0 0 0 6px rgba(228,85,95,.18)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.22,1,.36,1)',
        'in-out': 'cubic-bezier(.65,0,.35,1)',
        spring: 'cubic-bezier(.34,1.56,.64,1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
