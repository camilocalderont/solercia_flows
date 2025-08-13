/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './src/**/*.component.{html,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Times New Roman', 'Georgia', 'serif'],
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'neon-pulse': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.8' }
        }
      }
    },
  },
  plugins: [],
}