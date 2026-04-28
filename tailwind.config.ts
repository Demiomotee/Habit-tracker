import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        purple: {
          50:  '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff',
          300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7',
          600: '#9333ea', 700: '#7c3aed', 800: '#6d28d9', 900: '#4c1d95',
        },
      },
      borderRadius: { '2xl': '16px', '3xl': '24px', '4xl': '32px' },
      screens: { xs: '380px' },
    },
  },
  plugins: [],
};

export default config;
