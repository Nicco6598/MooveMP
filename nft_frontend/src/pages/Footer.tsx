import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-purple-100 mt-8 md:mt-24 mb-0 rounded-t-xl p-4 md:p-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center">
        {/* Sezione dei social */}
        <div className="text-center md:mr-8 mb-4 md:mb-0">
          <h2 className="mb-4 md:mb-8  flex flex-col items-center mt-4 text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">SOCIAL</h2>
          <div className="flex space-x-4 justify-center">
            <a
              href="#"
              className="text-xl md:text-2xl text-primary-500 hover:text-primary-600 transition-all duration-300"
            >
              <img src="https://cdn4.iconfinder.com/data/icons/miu-black-social-2/60/facebook-512.png" className="w-6 md:w-8 hover:animate-bounce transition-all duration-300" alt="Facebook" />
            </a>
            <a
              href="#"
              className="text-xl md:text-2xl text-primary-500 hover:text-primary-600 transition-all duration-300"
            >
              <img src="https://cdn2.iconfinder.com/data/icons/threads-by-instagram/24/x-logo-twitter-new-brand-contained-512.png" className="w-6 md:w-8 hover:animate-bounce transition-all duration-300" alt="X" />
            </a>
            <a
              href="#"
              className="text-xl md:text-2xl text-primary-500 hover:text-primary-600 transition-all duration-300"
            >
              <img src="https://cdn1.iconfinder.com/data/icons/social-media-circle-7/512/Circled_Instagram_svg-512.png" className="w-6 md:w-8 hover:animate-bounce transition-all duration-300" alt="Instagram" />
            </a>
            <a
              href="#"
              className="text-xl md:text-2xl text-primary-500 hover:text-primary-600 transition-all duration-300"
            >
              <img src="https://cdn1.iconfinder.com/data/icons/social-media-circle-7/512/Circled_Pinterest_svg-512.png" className="w-6 md:w-8 hover:animate-bounce transition-all duration-300" alt="Pinterest" />
            </a>
          </div>
        </div>
        
        {/* Sezione dei contatti e newsletter */}
        <div className="text-center md:ml-8">
          <h2 className="mb-4 md:mb-8 flex flex-col items-center mt-4 text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">CONTATTI</h2>
          <a href="mailto:Assistenza_Moove@moove.com" className="text-lg md:text-lg font-semibold text-purple-600 hover:underline">Assistenza_Moove@moove.com</a>
          <a href="tel:3900000000" className="block text-lg md:text-lg font-semibold text-purple-600 hover:underline mt-2">3900000000</a>
          <h2 className="mb-4 md:mb-8 md:mt-8 mt-4 flex flex-col items-center mt-4 text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">NEWSLETTER</h2>
          <form>
            <input
              type="email"
              placeholder="Indirizzo Email"
              className="border border-blue-700 rounded-xl mb-4 w-full text-center py-2 px-4 w-full md:w-40"
            />
            <button
              type="submit"
              className="bg-sky-500 mt-2 md:mt-4 text-white py-2 px-4 rounded-xl shadow-lg hover:shadow-2xl hover:bg-sky-600 lg:mt-0 ml-0 md:ml-4 w-full md:w-auto transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Iscriviti
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
