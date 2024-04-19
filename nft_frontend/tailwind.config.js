module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // Disabilita la modalità scura
    theme: {
      extend: {
        colors: {
          primary: '#4F46E5', // Definisce un colore primario personalizzato
          secondary: '#34D399', // Definisce un colore secondario personalizzato
        },
        fontFamily: {
          sans: ['Montserrat', 'Poppins', 'Arial', 'sans-serif'], // Imposta la famiglia di font predefinita
        },
      },
    },
    variants: {
      extend: {},
    },
    plugins: [],
  };
  