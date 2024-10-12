import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

export const ProviderContext = createContext<{
  provider: ethers.providers.Web3Provider | null;
  setProvider: React.Dispatch<React.SetStateAction<ethers.providers.Web3Provider | null>>;
}>({
  provider: null,
  setProvider: () => {},
});

type ProviderProviderProps = {
  children: ReactNode;
};

export const ProviderProvider: React.FC<ProviderProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}> 
      {children}
    </ProviderContext.Provider>
  );
};