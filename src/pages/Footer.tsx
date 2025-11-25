import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const quickLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Corse', path: '/rides' },
    { name: 'Miei NFT', path: '/owned' },
    { name: 'Aste Live', path: '/auctions' },
    { name: 'Mint NFT', path: '/mint' },
  ];

  const socials = [
    { name: 'X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { name: 'Discord', icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' },
    { name: 'Telegram', icon: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
  ];

  return (
    <footer className="mt-auto border-t border-neutral-800/50 bg-neutral-950/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white font-display">Moove</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              La piattaforma blockchain che rivoluziona la mobilità urbana sostenibile con NFT e sconti esclusivi.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(social => (
                <a 
                  key={social.name}
                  href="#" 
                  className="w-9 h-9 rounded-xl bg-neutral-800/50 hover:bg-accent-500/20 border border-neutral-700/50 hover:border-accent-500/50 flex items-center justify-center text-neutral-400 hover:text-accent-400 transition-all"
                  aria-label={social.name}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigazione</h3>
            <ul className="space-y-3">
              {quickLinks.map(item => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-neutral-400 hover:text-accent-400 text-sm transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-accent-500 transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contatti</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@moove.io" className="text-neutral-400 hover:text-accent-400 text-sm transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@moove.io
                </a>
              </li>
              <li className="text-neutral-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Milano, Italia
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Ricevi aggiornamenti su nuove funzionalità e NFT esclusivi.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email"
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30 transition-all pr-12"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white transition-colors"
                  aria-label="Iscriviti"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              {subscribed && (
                <p className="text-sm text-accent-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Grazie! Ti terremo aggiornato.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} Moove. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors">Privacy</a>
            <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors">Termini</a>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-500 font-mono text-xs">Sepolia Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

