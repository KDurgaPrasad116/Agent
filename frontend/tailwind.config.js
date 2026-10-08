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
        heading: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Linear/Stripe Deep Indigo Brand Action
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Canonical Primary
          700: '#4338CA', // Hover
          800: '#3730A3', // Active
          900: '#312E81',
          950: '#1E1B4B',
        },
        // Semantic Risk & Health Tokens
        score: {
          green: '#16A34A',
          'green-subtle': '#F0FDF4',
          'green-border': '#BBF7D0',
          amber: '#D97706',
          'amber-subtle': '#FFFBEB',
          'amber-border': '#FDE68A',
          red: '#DC2626',
          'red-subtle': '#FEF2F2',
          'red-border': '#FECACA',
        },
        // Surfaces & Neutrals
        surface: {
          50: '#FAFAF9',  // Warm off-white
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          850: '#1C1917',
          900: '#12151C', // Dark Card Surface
          925: '#0F1218',
          950: '#0B0D12', // Dark App Canvas
          975: '#07080B',
        },
        // Brand alias pointing to primary for backwards compatibility
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'floating': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderWidth: {
        'hairline': '1px',
      },
    },
  },
  plugins: [],
}
