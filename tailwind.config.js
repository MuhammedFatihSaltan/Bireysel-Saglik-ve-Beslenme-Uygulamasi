/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D17', // Based on the dark background in the reference image
        card: '#11141F', // Card background color
        primary: '#32D74B', // Success/Primary color for icon points
        accent: '#263445', // Button background color
      }
    },
  },
  plugins: [],
}
