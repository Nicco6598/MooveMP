import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectWalletButton from './ConnectWalletButton';
import MooveLogo from '../moove_logo.png';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/marketplace', title: 'Marketplace' },
    { path: '/rides', title: 'Corse' },
    { path: '/owned', title: 'Miei NFT' },
    { path: '/auctions', title: 'Aste Live' },
    { path: '/history', title: 'Storico' },
    { path: '/mint', title: 'Mint NFT', special: true }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-4 z-50 transition-all duration-500 ${
      scrolled ? "bg-white/80 backdrop-blur-xl" : "bg-white/60 backdrop-blur-lg"
    } rounded-2xl shadow-glass mx-4`}>
      <div className="container mx-auto max-w-7xl transition-all duration-300 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img src={MooveLogo} alt="MooveMP Logo" className="w-24 h-auto" />
            </Link>
            
            <ul className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        item.special 
                          ? "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg" 
                          : isActive
                            ? "bg-neutral-100 text-primary-700"
                            : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectWalletButton />
            
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="lg:hidden text-neutral-700 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMenu && (
          <div className="lg:hidden mt-3 pb-3 border-t border-neutral-200">
            <ul className="pt-2 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        item.special 
                          ? "bg-primary-500 text-white" 
                          : isActive
                            ? "bg-neutral-100 text-primary-700"
                            : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;