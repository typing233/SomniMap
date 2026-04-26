/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dream': {
          50: '#f5f3f7',
          100: '#e9e5ee',
          200: '#d4cce0',
          300: '#b9aacc',
          400: '#9a82b3',
          500: '#8266a0',
          600: '#6b5087',
          700: '#573f6f',
          800: '#4a365c',
          900: '#3e2e4d',
        },
        'night': {
          50: '#f0f0f5',
          100: '#e0e0eb',
          200: '#c0c0d7',
          300: '#a1a1c3',
          400: '#8181af',
          500: '#62629b',
          600: '#4e4e7c',
          700: '#3b3b5d',
          800: '#27273e',
          900: '#14141f',
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
