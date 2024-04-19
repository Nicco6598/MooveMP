import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { ProviderContext } from './ProviderContext'; // Import solo ProviderContext, ProviderProvider non è necessario qui

interface WalletBalanceProps {
  account: string; // Specifica il tipo di account come stringa
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ account }) => {
  const { provider } = useContext(ProviderContext); // Destruttura per ottenere solo la proprietà provider
  const [balance, setBalance] = useState('');

  const getBalance = async () => {
    if (provider && account) {
      // Accedi correttamente al provider per chiamare getBalance
      const balanceBigInt = await provider.getBalance(account);
      const balanceInEth = parseFloat(ethers.utils.formatEther(balanceBigInt)).toFixed(5);
      setBalance(balanceInEth);
    }
  };

  useEffect(() => {
    getBalance();
  }, [provider, account]);

  return (
    <div>
      {account && (
        <div className="bg-neutral-200 text-white text-center py-2 px-4 rounded-xl transition-all lg:ml-4 ">
          <p className="text-sm sm:flex sm:justify-between sm:items-center">
            <span className="font-bold text-sm text-gray-900 sm:inline hidden">
              {balance} ETH
            </span>
          </p>
          <p className="font-bold text-sm text-gray-900 sm:hidden text-xs">
            {balance} ETH
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
