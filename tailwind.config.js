/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a24a',
          hover: '#9e7e35',
          muted: '#c9a24a20',
        },
        surface: {
          DEFAULT: '#161616',
          raised: '#1C1C1C',
        },
        border: {
          DEFAULT: '#222222',
          subtle: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
