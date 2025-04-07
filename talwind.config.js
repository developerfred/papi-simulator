/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      fontSize: {
        '2xs': '0.625rem', // Extra small font size for addresses
      },
      colors: {
        primary: {
          50: '#f5eefa',
          100: '#e9d5f5',
          200: '#d4abeb',
          300: '#bc82e2',
          400: '#a558d8',
          500: '#8e2fd0',
          600: '#7524a6',
          700: '#5a1b7c',
          800: '#3d1153',
          900: '#200829',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      height: {
        'screen-75': '75vh',
        'screen-80': '80vh',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}