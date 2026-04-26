/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dream: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          light: '#a78bfa',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
        calm: {
          light: '#93c5fd',
          DEFAULT: '#60a5fa',
          dark: '#3b82f6',
        },
        soft: {
          light: '#c4b5fd',
          DEFAULT: '#a78bfa',
          dark: '#8b5cf6',
        },
        mood: {
          joy: '#fbbf24',
          sadness: '#60a5fa',
          fear: '#f87171',
          anger: '#ef4444',
          anxiety: '#fb923c',
          peace: '#4ade80',
          excitement: '#f472b6',
          confusion: '#a78bfa',
          neutral: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      backgroundImage: {
        'dream-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'calm-gradient': 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
        'night-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'calm': '0 8px 30px -4px rgba(139, 92, 246, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
