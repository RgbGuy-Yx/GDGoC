/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System tokens from DESIGN.md
        action: '#7AF1A7', // Primary mint accent
        'action-muted': '#B8F7CF', // Subtle mint tint
        'action-dark': '#15803d', // High-contrast green for accessible text
        ink: '#171717', // Primary text on light surfaces
        'ink-secondary': '#525252', // Secondary text
        'muted-ink': '#0A0A0A', // Deepest black
        canvas: '#F0FDF4', // Lightest mint wash / background
        surface: '#FFFFFF', // Primary content background
        'surface-alt': '#F4F4F4', // Alternate light background
        hairline: '#E5E5E5', // Clean hairline border
        google: {
          blue: '#1a73e8',
          blueHover: '#1557b0',
          blueLight: '#e8f0fe',
          red: '#ea4335',
          redLight: '#fce8e6',
          yellow: '#fbbc04',
          yellowLight: '#fef7e0',
          green: '#34a853',
          greenLight: '#e6f4ea',
          gray: '#5f6368',
          border: '#dadce0',
          bg: '#f8fafd'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9999px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'ambient': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 12px 32px -4px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
