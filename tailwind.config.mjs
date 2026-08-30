/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // COLOR 1: Orange — CTA, aksen, highlight
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',   // Orange utama
          600: '#ea6c0a',
          700: '#c2510a',
          800: '#9a3d08',
          900: '#7c3107',
        },
        // COLOR 2: Navy — background, text, section gelap
        navy: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c4d4fe',
          300: '#9ab4fd',
          400: '#6a8afb',
          500: '#4060f8',
          600: '#2840ef',
          700: '#1e30dc',
          800: '#1a27b3',
          900: '#0f172a',   // Navy utama (darkest)
          950: '#080d1a',
        },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.8s ease-out forwards',
        'fade-in':     'fadeIn 1s ease-out forwards',
        'float':       'float 3s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow':   'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
