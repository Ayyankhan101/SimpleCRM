/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        carga: {
          primary: '#F0E5C5',
          secondary: '#332B1C',
          tertiary: '#E2F4CB',
          neutral: '#121212',
          surface: 'rgba(240, 229, 197, 0.55)',
          'surface-dark': 'rgba(51, 43, 28, 0.55)',
        },
      },
      borderRadius: {
        'none': '0px',
        'sm': '0px',
        'DEFAULT': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        '4xl': '0px',
        'full': '9999px',
      },
      boxShadow: {
        'carga': 'inset 0 1px 2px 0px rgba(52, 40, 20, 0.55)',
        'carga-lg': '0 2px 3px 0px rgba(52, 40, 20, 0.25), 0 18px 44px 0px rgba(52, 40, 20, 0.38)',
        'carga-inset': 'inset 0 1px 2px 0px rgba(52, 40, 20, 0.55)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
