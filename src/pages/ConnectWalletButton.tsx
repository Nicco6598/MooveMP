import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { BrowserProvider, Eip1193Provider } from 'ethers';
import WalletBalance from './WalletBalance';
import { ProviderContext } from './ProviderContext';

// Sepolia chain configuration
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const ConnectWalletButton = () => {
  const [account, setAccount] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { setProvider } = useContext(ProviderContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const resetApp = useCallback(() => {
    setProvider(null);
    setAccount('');
    localStorage.removeItem('walletConnected');
  }, [setProvider]);

  const switchToSepolia = async () => {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError: unknown) {
      // Chain non aggiunta, proviamo ad aggiungerla
      if ((switchError as { code?: number })?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
          return true;
        } catch {
          console.error('Impossibile aggiungere la rete Sepolia');
          return false;
        }
      }
      console.error('Errore nel cambio rete:', switchError);
      return false;
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Per favore installa MetaMask o un altro wallet compatibile.');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Richiedi accesso agli account
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error('Nessun account disponibile');
      }

      const connectedProvider = new BrowserProvider(window.ethereum);
      const network = await connectedProvider.getNetwork();

      // Verifica che siamo sulla rete corretta (Sepolia)
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        const switched = await switchToSepolia();
        if (!switched) {
          alert("Per favore, connettiti alla rete Sepolia per utilizzare l'applicazione.");
          setIsConnecting(false);
          return;
        }
        // Ricrea il provider dopo il cambio rete
        const newProvider = new BrowserProvider(window.ethereum);
        setProvider(newProvider);
      } else {
        setProvider(connectedProvider);
      }

      setAccount(accounts[0]);
      localStorage.setItem('walletConnected', 'true');

      // Listeners per eventi dal provider
      const handleAccountsChanged = (newAccounts: unknown) => {
        const accs = newAccounts as string[];
        if (accs.length === 0) {
          resetApp();
        } else {
          setAccount(accs[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);

    } catch (error) {
      console.error('Connessione al wallet fallita:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [setProvider, resetApp]);

  const disconnectWallet = useCallback(() => {
    resetApp();
    setShowDropdown(false);
  }, [resetApp]);

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

  // Connetti automaticamente all'avvio se c'è un wallet connesso in precedenza
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected && window.ethereum) {
      connectWallet();
    }
  }, [connectWallet]);

  // Icona wallet generica
  const WalletIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {account ? (
        <div>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 py-2 px-3 bg-neutral-800/80 backdrop-blur-sm rounded-xl border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <WalletIcon />
              </div>
              <span className="text-sm font-mono text-neutral-200 hidden md:inline-block">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-800/50">
                <p className="text-xs text-neutral-500 mb-2">Indirizzo collegato</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono text-neutral-200 truncate flex-1">{account}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(account);
                      const el = document.createElement('div');
                      el.textContent = 'Copiato!';
                      el.className = 'fixed top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-[100]';
                      document.body.appendChild(el);
                      setTimeout(() => document.body.removeChild(el), 2000);
                    }}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
                    aria-label="Copia indirizzo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Balance */}
              <div className="px-4 py-4 border-b border-neutral-800/50">
                <WalletBalance account={account} showInFull={true} />
              </div>
              
              {/* Actions */}
              <div className="px-4 py-3 space-y-2">
                <a 
                  href={`https://sepolia.etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visualizza su Etherscan
                </a>
                
                <button 
                  onClick={disconnectWallet}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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
          className="flex items-center gap-2 py-2 px-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white rounded-xl transition-all duration-300 text-sm font-medium"
        >
          <WalletIcon />
          <span className="hidden md:inline">Connetti</span>
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;

