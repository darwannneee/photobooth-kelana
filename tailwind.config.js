/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#fdf9f5',
          2: '#f5efe8',
        },
        ink: {
          DEFAULT: '#1e1510',
          sub: '#6b5a52',
          muted: '#a89890',
        },
        rim: {
          DEFAULT: '#ede6dc',
          2: '#e0d8ce',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
        'seg-fill': {
          from: { width: '0%' },
          to: { width: '100%' },
        },
        'ring-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.4)' },
          '70%': { boxShadow: '0 0 0 16px rgba(255,255,255,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0)' },
        },
      },
      animation: {
        flash: 'flash 0.35s ease-in-out',
        'seg-fill': 'seg-fill 3s linear forwards',
        'ring-pulse': 'ring-pulse 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}
