import ConnectWalletButton from './ConnectWalletButton';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MooveLogo from '../moove_logo.png'; // Importa il logo come variabile

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="sticky top-4 justify-items-center z-10 bg-gradient-to-r from-purple-200 to-sky-200 rounded-2xl shadow-[0px_0px_10px_10px_#edf2f7]">
      <div className="container mx-auto max-w-screen-xl transition-all duration-300 flex justify-between items-center p-4">
        <div className="flex items-center">
          <img src={MooveLogo} alt="Moove_Logo" className="w-24 mr-4" /> {/* Utilizza la variabile per il logo */}
          <ul className={`lg:flex space-x-4 uppercase text-center ${showMenu ? 'block' : 'hidden'}`}>
            <li><Link to="/" className="text-black hover:text-blue-500 font-bold text-sm active:text-orange-500 transition-all duration-300 ease-in-out transform hover:scale-105">Home</Link></li>
            <li><Link to="/mint" className="text-black hover:text-blue-500 font-bold text-sm active:text-orange-500 transition-all duration-300 ease-in-out transform hover:scale-105">Mint NFT</Link></li>
            <li><Link to="/owned" className="text-black hover:text-blue-500 font-bold text-sm active:text-orange-500 transition-all duration-300 ease-in-out transform hover:scale-105">My NFTs</Link></li>
            <li><Link to="/history" className="text-black hover:text-blue-500 font-bold text-sm active:text-orange-500 transition-all duration-300 ease-in-out transform hover:scale-105">History</Link></li>
          </ul>
        </div>
        <div className="block lg:hidden">
          <button onClick={() => setShowMenu(!showMenu)} className="text-black focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        <ConnectWalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
