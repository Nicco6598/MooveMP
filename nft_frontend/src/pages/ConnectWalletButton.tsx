import React, { useState, useEffect, useContext, useRef } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import WalletBalance from './WalletBalance';
import { ProviderContext } from './ProviderContext';

// Configurazione dei provider supportati
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        11155111: "https://eth-sepolia.g.alchemy.com/v2/demo" // Sostituisci con la tua API key
      },
      chainId: 11155111 // Sepolia testnet
    }
  }
};

const web3Modal = new Web3Modal({
  network: 'sepolia',
  cacheProvider: true,
  providerOptions,
  theme: {
    background: "rgb(249, 250, 251)",
    main: "rgb(99, 102, 241)",
    secondary: "rgb(107, 114, 128)",
    border: "rgba(229, 231, 235, 0.8)",
    hover: "rgba(243, 244, 246, 0.5)"
  }
});

const ConnectWalletButton = () => {
  const [account, setAccount] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [connectionType, setConnectionType] = useState<'metamask' | 'walletconnect' | null>(null);
  const { provider, setProvider } = useContext(ProviderContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const connectWallet = async () => {
    try {
      const modalProvider = await web3Modal.connect();
      const connectedProvider = new ethers.providers.Web3Provider(modalProvider);
      const userAccount = await connectedProvider.getSigner().getAddress();
      const network = await connectedProvider.getNetwork();

      // Determina il tipo di provider
      if (modalProvider.isMetaMask) {
        setConnectionType('metamask');
      } else if (modalProvider.wc) {
        setConnectionType('walletconnect');
      }

      // Verifica che siamo sulla rete corretta (Sepolia)
      if (network.chainId !== 11155111) {
        alert("Per favore, connettiti alla rete Sepolia per utilizzare l'applicazione.");
        return;
      }

      setProvider(connectedProvider);
      setAccount(userAccount);

      // Listeners per eventi dal provider
      modalProvider.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0]);
      });

      modalProvider.on('chainChanged', () => {
        window.location.reload();
      });

      modalProvider.on('disconnect', () => {
        resetApp();
      });
    } catch (error) {
      console.error('Connessione al wallet fallita:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await web3Modal.clearCachedProvider();
      resetApp();
      setShowDropdown(false);
    } catch (error) {
      console.error('Errore durante la disconnessione del wallet:', error);
    }
  };
  
  const resetApp = () => {
    try {
      setProvider(null);
      setAccount('');
      setConnectionType(null);
    } catch (error) {
      console.error('Errore durante il reset dell\'applicazione:', error);
    }
  };

  // Chiudi il dropdown se si fa clic al di fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Connetti automaticamente all'avvio se c'è un provider in cache
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  // Icona del wallet in base al tipo di connessione
  const getWalletIcon = () => {
    if (connectionType === 'metamask') {
      return (
        <svg width="20" height="20" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32.9582 1L19.8241 10.7183L22.2633 5.09986L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.04179 1L15.0242 10.8236L12.7367 5.09986L2.04179 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28.2291 23.5335L24.7545 28.8721L32.1874 30.8783L34.245 23.6501L28.2291 23.5335Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M0.778687 23.6501L2.82493 30.8783L10.2455 28.8721L6.78324 23.5335L0.778687 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86285 14.6057L7.8186 17.7397L15.1323 18.0719L14.8882 10.093L9.86285 14.6057Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25.1374 14.6053L20.0291 10.0005L19.8239 18.0714L27.1255 17.7393L25.1374 14.6053Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.2453 28.8722L14.6866 26.7025L10.9311 23.7015L10.2453 28.8722Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.3135 26.7025L24.7546 28.8722L24.0689 23.7015L20.3135 26.7025Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (connectionType === 'walletconnect') {
      return (
        <svg width="20" height="20" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M82.45 213.455C131.712 164.191 212.288 164.191 261.55 213.455L268.576 220.48C271.933 223.838 271.933 229.343 268.576 232.701L247.902 253.375C246.224 255.053 243.471 255.053 241.792 253.375L231.843 243.425C197.454 209.036 146.546 209.036 112.157 243.425L101.552 254.03C99.8737 255.708 97.1209 255.708 95.4429 254.03L74.7685 233.355C71.4106 229.997 71.4106 224.492 74.7685 221.134L82.45 213.455ZM307.565 259.469L326.047 277.952C329.405 281.31 329.405 286.815 326.047 290.173L253.471 362.748C250.113 366.106 244.608 366.106 241.25 362.748C241.25 362.748 241.25 362.748 241.25 362.748L192.891 314.389C192.052 313.55 190.685 313.55 189.846 314.389C189.846 314.389 189.846 314.389 189.846 314.389L141.499 362.736C138.141 366.094 132.636 366.094 129.278 362.736C129.278 362.736 129.278 362.736 129.278 362.736L56.7143 290.161C53.3564 286.803 53.3564 281.298 56.7143 277.94L75.2082 259.446C78.5661 256.088 84.0711 256.088 87.429 259.446L135.799 307.815C136.638 308.654 138.005 308.654 138.844 307.815C138.844 307.815 138.844 307.815 138.844 307.815L187.191 259.457C190.549 256.099 196.054 256.099 199.412 259.457L247.792 307.838C248.631 308.677 249.998 308.677 250.837 307.838L299.194 259.48C302.552 256.123 308.057 256.123 311.415 259.48L307.565 259.469Z" fill="#3B99FC"/>
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {account ? (
        <div>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 py-2 px-4 bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300"
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-2">
              {getWalletIcon()}
              <span className="text-sm font-medium text-neutral-700 hidden md:inline-block">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
              <span className="text-sm font-medium text-neutral-700 md:hidden">
                {account.substring(0, 4)}...
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1">Indirizzo collegato</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono text-neutral-800 truncate">{account}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(account);
                      // Feedback visivo
                      const el = document.createElement('div');
                      el.textContent = 'Copiato!';
                      el.className = 'fixed top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm';
                      document.body.appendChild(el);
                      setTimeout(() => document.body.removeChild(el), 2000);
                    }}
                    className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                    aria-label="Copia indirizzo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-4 py-3 border-b border-neutral-200">
                <WalletBalance account={account} showInFull={true} />
              </div>
              
              <div className="px-4 py-3">
                <a 
                  href={`https://sepolia.etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-neutral-700 hover:text-primary-600 transition-colors mb-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visualizza su Etherscan
                </a>
                
                <button 
                  onClick={disconnectWallet}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnetti Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={connectWallet} 
          className="flex items-center gap-2 py-2 px-4 bg-primary-500 text-white rounded-xl shadow-sm hover:bg-primary-600 hover:shadow-md transition-all duration-300 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          <span className="hidden md:inline">Connetti Wallet</span>
          <span className="md:hidden">Connetti</span>
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;