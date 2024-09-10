/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector', // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {},
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      boxShadow: {
        one: '0px 0px 4px rgba(0, 0, 0, 0.5)',
      },
      text: {
        // TODO: add typography tokens
        base: '14px',
        scale: 1.2,
      },
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
    colors: {
      primary: '#ffb938',
      ['primary-thin']: 'rgba(255, 185, 56, 0.1)',
      background: '#131314',
      foreground: '#222224',
      success: '#44af69',
      error: '#ef6461',
      warning: '#ffb938',
      link: '#6c97b5',
      white: '#fafafa',
      black: 'black',
      grey: '#7d7d85',
      'metallic-grey': '#18191a',
      ['dark-grey']: '#38393b',
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
