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
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        glassfin: {
          primary: '#E0714A',
          secondary: '#123029',
          tertiary: '#2F9078',
          neutral: '#FFF6F1',
          surface: 'rgba(255, 246, 241, 0.55)',
          'surface-dark': 'rgba(18, 48, 41, 0.55)',
          'text-primary': '#123029',
          'text-secondary': '#E0714A',
          accent: '#E0714A',
          border: '#123029',
        },
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'DEFAULT': '12px',
        'md': '12px',
        'lg': '16px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
        'full': '9999px',
      },
      boxShadow: {
        'glass': '0 20px 44px -22px rgba(9, 44, 36, 0.6), 0 1px 0px 0px rgba(255, 255, 255, 0.85) inset',
        'glass-lg': '0 20px 44px -22px rgba(9, 44, 36, 0.6), 0 1px 0px 0px rgba(255, 255, 255, 0.85) inset, 0 0px 0px 0px rgba(0, 0, 0, 0)',
        'glass-inset': '0 14px 26px -14px rgba(9, 44, 36, 0.55) inset',
        'glass-border': '0 0px 0px 0.5px rgba(255, 255, 255, 0.4) inset',
        'glass-dark': '0 20px 44px -22px rgba(0, 0, 0, 0.6), 0 1px 0px 0px rgba(255, 255, 255, 0.08) inset',
        'glass-dark-lg': '0 20px 44px -22px rgba(0, 0, 0, 0.6), 0 1px 0px 0px rgba(255, 255, 255, 0.08) inset',
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
      backdropBlur: {
        'glass': '12px',
        'glass-sm': '6px',
      },
    },
  },
  plugins: [],
}
