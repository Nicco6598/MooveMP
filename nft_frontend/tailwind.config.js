module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Modifica 'purge' in 'content'
  darkMode: 'media', // Usa 'media' o 'class' per la modalità scura
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#34D399',
      },
      fontFamily: {
        sans: ['Montserrat', 'Poppins', 'Arial', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
