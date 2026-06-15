/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#070713',
          800: '#0d0b1f',
          700: '#15122b',
          600: '#1d1838',
        },
        neon: {
          cyan: '#22d3ee',
          pink: '#f472b6',
          violet: '#a855f7',
          lime: '#a3e635',
          gold: '#fbbf24',
        },
      },
      boxShadow: {
        glow: '0 0 40px -8px var(--tw-shadow-color)',
        'glow-lg': '0 0 80px -12px var(--tw-shadow-color)',
        inset: 'inset 0 2px 6px rgba(255,255,255,0.18), inset 0 -8px 18px rgba(0,0,0,0.35)',
      },
      opacity: {
        7: '0.07',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1, 1) translateY(0)' },
          '50%': { transform: 'scale(1.03, 0.97) translateY(2px)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '60%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pop-soft': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        squish: {
          '0%': { transform: 'scale(1,1)' },
          '30%': { transform: 'scale(1.15,0.82)' },
          '60%': { transform: 'scale(0.9,1.12)' },
          '100%': { transform: 'scale(1,1)' },
        },
        hop: {
          '0%, 100%': { transform: 'translateY(0) scaleY(1)' },
          '20%': { transform: 'translateY(0) scaleY(0.85)' },
          '50%': { transform: 'translateY(-34px) scaleY(1.08)' },
          '80%': { transform: 'translateY(0) scaleY(0.92)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.06)' },
        },
        'rise-fade': {
          '0%': { transform: 'translateY(0) scale(0.7)', opacity: '0' },
          '20%': { transform: 'translateY(-10px) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateY(-72px) scale(1)', opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.7)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 92%, 100%': { transform: 'scaleY(1)' },
          '96%': { transform: 'scaleY(0.1)' },
        },
        'ring-spin': {
          to: { 'stroke-dashoffset': '0' },
        },
        sheen: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        breathe: 'breathe 3.4s ease-in-out infinite',
        'float-y': 'float-y 4s ease-in-out infinite',
        wiggle: 'wiggle 0.4s ease-in-out',
        pop: 'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pop-soft': 'pop-soft 0.28s ease-out',
        squish: 'squish 0.45s ease-out',
        hop: 'hop 0.6s ease-in-out',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        shimmer: 'shimmer 2.5s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'rise-fade': 'rise-fade 1s ease-out forwards',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        'spin-slow': 'spin-slow 16s linear infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        sheen: 'sheen 3s linear infinite',
      },
    },
  },
  plugins: [],
};
