/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D17',
        card: '#11141F',
        primary: '#32D74B',
        accent: '#263445',
      }
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
}
