import React, { useState, useEffect, useContext, useCallback } from 'react';
import { formatEther } from 'ethers';
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
        const balanceInEth = parseFloat(formatEther(balanceBigInt)).toFixed(4);

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
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Saldo Wallet</h3>
          <button
            onClick={getBalance}
            className="text-neutral-500 hover:text-accent-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Aggiorna saldo"
            disabled={isLoading}
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-neutral-800 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-neutral-800 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 border border-accent-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gradient">
                {balance} ETH
              </p>
              <p className="text-xs text-neutral-500">
                ≈ ${(parseFloat(balance) * 3500).toFixed(2)} USD
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
        <p className="text-red-400 text-xs">Errore</p>
      ) : isLoading ? (
        <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse"></div>
      ) : (
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-500"></div>
          <p className="text-sm font-medium text-neutral-200">{balance} ETH</p>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
