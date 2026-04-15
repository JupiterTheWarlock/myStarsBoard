/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        term: {
          bg: 'var(--term-bg)',
          surface: 'var(--term-surface)',
          'surface-2': 'var(--term-surface-2)',
          border: 'var(--term-border)',
          text: 'var(--term-text)',
          muted: 'var(--term-muted)',
          dim: 'var(--term-dim)',
          accent: 'var(--term-accent)',
          'accent-bright': 'var(--term-accent-bright)',
          'accent-glow': 'var(--term-accent-glow)',
          'accent-dim': 'var(--term-accent-dim)',
        },
      },
      fontFamily: {
        terminal: ['"Courier Prime"', 'Consolas', 'monospace'],
      },
      keyframes: {
        'term-print': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'term-print': 'term-print 0.3s ease-out forwards',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
