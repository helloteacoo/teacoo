/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#215F97',
        mainBg: '#F3F4F6',
        cardBg: '#E8EEF5',
        maindarkBg: '#1E293B',
        carddarkBg: '#334155',
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#1E293B'
        },
        foreground: {
          DEFAULT: '#000000',
          dark: '#FFFFFF'
        },
        
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}