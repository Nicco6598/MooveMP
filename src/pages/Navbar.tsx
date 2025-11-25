import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectWalletButton from './ConnectWalletButton';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/marketplace', title: 'Marketplace', number: '01' },
    { path: '/rides', title: 'Corse', number: '02' },
    { path: '/owned', title: 'Miei NFT', number: '03' },
    { path: '/auctions', title: 'Aste Live', number: '04' },
    { path: '/history', title: 'Storico', number: '05' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? "bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50" 
        : "bg-transparent"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/40 transition-all">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white font-display">Moove</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-neutral-600 text-xs font-mono">[ {item.number} ]</span>
                  <span>{item.title}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Mint Button */}
            <Link
              to="/mint"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Mint NFT</span>
            </Link>

            <ConnectWalletButton />
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMenu && (
          <div className="lg:hidden py-4 border-t border-neutral-800/50 animate-fadeIn">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setShowMenu(false)}
                  >
                    <span className="text-neutral-600 text-xs font-mono">[ {item.number} ]</span>
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              <Link
                to="/mint"
                className="flex items-center justify-center gap-2 mx-4 mt-4 px-4 py-3 bg-accent-500 text-white text-sm font-medium rounded-xl"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Mint NFT</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

