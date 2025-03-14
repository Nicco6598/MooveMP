import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { ProviderContext } from './ProviderContext';

interface WalletBalanceProps {
  account: string;
  showInFull?: boolean; // Per mostrare il saldo completo o in una versione compatta
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ account, showInFull = false }) => {
  const { provider } = useContext(ProviderContext);
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const getBalance = async () => {
    if (provider && account) {
      try {
        setIsLoading(true);
        setError('');
        
        const balanceBigInt = await provider.getBalance(account);
        const balanceInEth = parseFloat(ethers.utils.formatEther(balanceBigInt)).toFixed(4);
        
        setBalance(balanceInEth);
      } catch (error) {
        console.error('Errore nel recupero del saldo:', error);
        setError('Impossibile recuperare il saldo');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    getBalance();
    
    // Aggiorna il saldo ogni 30 secondi
    const intervalId = setInterval(() => {
      getBalance();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [provider, account]);

  if (showInFull) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-700">Saldo Wallet</h3>
          <button 
            onClick={getBalance}
            className="text-primary-500 hover:text-primary-600 p-1 rounded-full transition-colors"
            aria-label="Aggiorna saldo"
            disabled={isLoading}
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-neutral-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-primary-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                {balance} ETH
              </p>
              <p className="text-xs text-neutral-500">
                ~{(parseFloat(balance) * 3500).toFixed(2)} USD
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {error ? (
        <p className="text-red-600 text-xs">Errore</p>
      ) : isLoading ? (
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse"></div>
      ) : (
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
          <p className="text-sm font-medium">{balance} ETH</p>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;