import React, { useState, useEffect, useContext } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import WalletBalance from './WalletBalance';
import { ProviderContext } from './ProviderContext';

const providerOptions = {
  /* qui puoi inserire altri provider se necessario */
};

const web3Modal = new Web3Modal({
  network: 'sepolia', // cambierai dinamicamente tra mainnet e sepolia
  cacheProvider: true, // se vero, web3modal ricorderà quale provider è stato selezionato
  providerOptions, // provider options
});

const ConnectWalletButton = () => {
  const [account, setAccount] = useState('');
  const { provider, setProvider } = useContext(ProviderContext);

  const connectWallet = async () => {
    try {
      const modalProvider = await web3Modal.connect();
      const connectedProvider = new ethers.providers.Web3Provider(modalProvider);
      console.log("Provider in ConnectWalletButton:", connectedProvider);
      const userAccount = await connectedProvider.getSigner().getAddress();

      setProvider(connectedProvider);
      setAccount(userAccount);

      // Ascolta l'evento di disconnessione
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
    } catch (error) {
      console.error('Errore durante la disconnessione del wallet:', error);
    }
  };
  
  const resetApp = () => {
    try {
      setProvider(null);
      setAccount('');
    } catch (error) {
      console.error('Errore durante il reset dell\'applicazione:', error);
    }
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <div className="flex items-center transition-all">
      {account ? (
        <div className='transition-all'>
          <button onClick={disconnectWallet} className="bg-sky-500 auto text-sm flex ml-16 font-bold justify-between items-center text-white text-center py-2 px-4 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-red-600 transition-all duration-300 ease-in-out transform hover:scale-105">
            WALLET: {account.substring(0, 6)}..{account.substring(account.length - 4)} <WalletBalance account={account}/>
          </button>
        </div>
      ) : (
        <button onClick={connectWallet} className="bg-blue-600 text-white py-2 px-4 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105">
          Connetti Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
