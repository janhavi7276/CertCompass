/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffc',
          300: '#7cc2fa',
          400: '#36a2f7',
          500: '#0c87eb',
          600: '#0269c7',
          700: '#0354a1',
          800: '#074885',
          900: '#0c3d6e',
          950: '#082749',
        }
      }
    },
  },
  plugins: [],
}
