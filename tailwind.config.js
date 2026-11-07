/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        facility: {
          950: '#07090e',
          900: '#0d131f',
          800: '#141d30',
          700: '#1e2c47',
          cyan: '#00f3ff',
          blue: '#0066ff',
          purple: '#b347ff',
          neon: '#0df'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

