import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

interface ProviderContextType {
  provider: BrowserProvider | null;
  setProvider: React.Dispatch<React.SetStateAction<BrowserProvider | null>>;
}

export const ProviderContext = createContext<ProviderContextType>({
  provider: null,
  setProvider: () => {},
});

interface ProviderProviderProps {
  children: ReactNode;
}

export const ProviderProvider: React.FC<ProviderProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new BrowserProvider(window.ethereum));
    }
  }, []);

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}> 
      {children}
    </ProviderContext.Provider>
  );
};

