/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37',
          dark:    '#B8961E',
          light:   '#2C2200',
        },
        accent: {
          DEFAULT: '#FFD700',
          dark:    '#D4AF37',
          light:   '#1F1900',
        },
        success: {
          DEFAULT: '#D4AF37',
          dark:    '#B8961E',
          light:   '#1A1400',
        },
        navy:  '#FFFFFF',
        app:   '#09090B',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
