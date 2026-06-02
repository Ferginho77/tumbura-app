/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          200: 'var(--color-warning-200)',
          300: 'var(--color-warning-300)',
          400: 'var(--color-warning-400)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
        },
        bg: {
          50: 'var(--color-bg-50)',
          100: 'var(--color-bg-100)',
          200: 'var(--color-bg-200)',
        },
        text: {
          dark: 'var(--color-text-dark)',
          muted: 'var(--color-text-muted)',
        },
        card: {
          DEFAULT: 'var(--color-card-bg)',
        },
        input: {
          DEFAULT: 'var(--color-input-bg)',
        },
        sidebar: {
          DEFAULT: 'var(--color-sidebar-bg)',
        }
      },
      borderRadius: {
        custom: 'var(--border-radius)',
      },
      boxShadow: {
        'custom-sm': 'var(--shadow-sm)',
        'custom-md': 'var(--shadow-md)',
        'custom-lg': 'var(--shadow-lg)',
      }
    },
  },
  plugins: [],
}