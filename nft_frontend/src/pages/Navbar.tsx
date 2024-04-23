import ConnectWalletButton from './ConnectWalletButton';
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-4 justify-items-center z-10 bg-gradient-to-r from-sky-200 to-purple-200 rounded-2xl shadow-[0px_0px_10px_10px_#edf2f7]">
      <div className="container mx-auto max-w-screen-xl transition-all duration-300 flex justify-between items-center p-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="w-24 mr-4" />
          <ul className="flex space-x-4 uppercase text-center">
            <li><Link to="/" className="text-black hover:text-purple-500 font-bold text-sm active:text-orange-500">Home</Link></li>
            <li><Link to="/mint" className="text-black hover:text-purple-500 font-bold text-sm active:text-orange-500">Mint NFT</Link></li>
            <li><Link to="/owned" className="text-black hover:text-purple-500 font-bold text-sm active:text-orange-500">My NFTs</Link></li>
          </ul>
        </div>
        <ConnectWalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
