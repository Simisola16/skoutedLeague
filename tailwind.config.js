/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          dark: '#0D0F14',
          surface: '#141720',
          card: '#1A1D28',
          border: '#252A38',
          live: '#FF4B4B',
          green: '#00E676',
          gold: '#FFB800',
          blue: '#3B82F6'
        }
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 75, 75, 0.4), 0 0 10px rgba(255, 75, 75, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(255, 75, 75, 0.8), 0 0 25px rgba(255, 75, 75, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
