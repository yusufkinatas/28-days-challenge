/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{mjs,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        ping: {
          '0%': { transform: 'scale(0)', opacity: 0.5 },
          '75%, 100%': { transform: 'scale(2)', opacity: 0 }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out forwards',
        sparkle: 'ping 1s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
