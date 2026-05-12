/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8228',
          dark: '#E67520',
          light: '#FFF4ED',
        },
        secondary: {
          DEFAULT: '#0A1F44',
          light: '#1B3A6D',
        },
        gray: {
          DEFAULT: '#4A4A4A',
          light: '#818A91',
          lighter: '#F5F5F5',
          border: '#E8E8E8',
        },
        error: {
          DEFAULT: '#EA4335',
          light: '#FEEEEE',
        }
      },
      fontFamily: {
        montserrat: ["'Montserrat'", 'sans-serif'],
      }
    },
  },
  plugins: [],
};
