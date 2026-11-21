/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#05070b', 900: '#080b11', 850: '#0b0f17', 800: '#10151f', 700: '#1a2130' },
        fog: { 100: '#eef1f6', 300: '#c3cad6', 400: '#8d97a9', 500: '#646e80', 600: '#454e5e' },
        mint: '#5eead4',
        sky: '#7dd3fc',
        iris: '#a78bfa',
        ember: '#fbbf77',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      letterSpacing: { tightest: '-0.045em' },
    },
  },
  plugins: [],
};
