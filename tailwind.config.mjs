/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      animation: {
        'ario-spin': 'spin 1.5s linear infinite',
        'ario-pulse': 'ario-pulse 2s ease-in-out infinite',
        'skeleton-pulse': 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
      keyframes: {
        'ario-pulse': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      backgroundImage: {
        'primary-gradient':
          'linear-gradient(90deg, rgb(var(--color-primary) / 0.1), rgb(var(--color-primary)) 100%)',
        'primary-gradient-thin':
          'linear-gradient(90deg, rgb(0 0 0 / 0.1), rgb(var(--color-primary) / 0.3))',
        'grey-gradient': 'linear-gradient(90deg, #48484CBF, #48484C80)',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        'sans-bold': ['Rubik-Bold', 'sans-serif'],
      },
      boxShadow: {
        one: '0px 0px 4px rgba(0, 0, 0, 0.5)',
        'tooltip': '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
    colors: {
      // Semantic colors using CSS variables for theme support
      primary: {
        DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
        foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        thin: 'rgb(var(--color-primary) / 0.1)',
      },
      secondary: {
        DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
        foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
      },
      background: 'rgb(var(--color-background) / <alpha-value>)',
      foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
      surface: {
        DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
        foreground: 'rgb(var(--color-surface-foreground) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
        foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
      },
      success: {
        DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
        thin: 'rgb(var(--color-success) / 0.1)',
        bg: 'rgb(var(--color-success-bg) / <alpha-value>)',
      },
      error: {
        DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
        thin: 'rgb(var(--color-error) / 0.1)',
      },
      warning: {
        DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
        light: 'rgb(var(--color-warning-light) / <alpha-value>)',
        bg: 'rgb(var(--color-warning-bg) / <alpha-value>)',
      },
      link: {
        DEFAULT: 'rgb(var(--color-link) / <alpha-value>)',
        hover: 'rgb(var(--color-link-hover) / <alpha-value>)',
      },
      border: 'rgb(var(--color-border) / <alpha-value>)',
      ring: 'rgb(var(--color-ring) / <alpha-value>)',
      input: 'rgb(var(--color-input) / <alpha-value>)',
      // Static colors
      white: '#fafafa',
      black: '#121212',
      transparent: 'transparent',
      // Legacy compatibility - map to new semantic tokens
      grey: 'rgb(var(--color-muted) / <alpha-value>)',
      'light-grey': 'rgb(var(--color-muted-foreground) / <alpha-value>)',
      'dark-grey': 'rgb(var(--color-border) / <alpha-value>)',
      'metallic-grey': 'rgb(var(--color-metallic) / <alpha-value>)',
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
