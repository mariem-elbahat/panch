/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F4F0E5',
        paper: '#FFFEF8',
        paper2: '#F9F7EF',
        ink: '#1C3028',
        forest: {
          DEFAULT: '#174B3A',
          hover: '#123B2D',
          dark: '#0D271E'
        },
        green: {
          brand: '#2F6B4F',
          light: '#3E805E'
        },
        lime: {
          brand: '#C6DF78',
          light: '#DCE9AE'
        },
        sage: {
          brand: '#DCE6D8',
          light: '#E8EEE3'
        },
        line: '#CCD5C9',
        muted: '#607267',
        dim: '#87958B',
        clay: {
          DEFAULT: '#C76D54',
          light: '#F2DFD7'
        },
        gold: {
          DEFAULT: '#B18A43',
          light: '#EFE5CF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '4px',
        'lg': '6px',
      }
    },
  },
  plugins: [],
}
