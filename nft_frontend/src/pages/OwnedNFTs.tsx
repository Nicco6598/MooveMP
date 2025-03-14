import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFT {
  tokenId: number;
  owner: string;
  price: ethers.BigNumber;
  rarity: string;
  discount: string;
  discountOn: string;
}

const OwnedNFTs: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { provider } = useContext(ProviderContext);

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!provider) return;
      
      try {
        setLoading(true);
        const signer = provider.getSigner();
        const contract = getContract(provider);
        const totalSupply = await contract.nextTokenId();
        const items: NFT[] = [];
        
        for (let i = 0; i < totalSupply.toNumber(); i++) {
          const owner = await contract.ownerOf(i);
          if (owner === await signer.getAddress()) {
            const tokenPrice = await contract.tokenPrices(i);
            const tokenAttributes = await contract.getTokenAttributes(i);
            
            // Parse attributes
            const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => {
              const cleanedAttr = attr.replace(/.*?:/, '').trim();
              return cleanedAttr;
            });
            
            items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn });
          }
        }
        
        setNfts(items);
      } catch (error) {
        console.error("Error fetching owned NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedNFTs();
  }, [provider]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
          I Miei NFT
        </h1>
        <p className="text-neutral-600 max-w-2xl text-center">
          Gestisci la tua collezione di NFT Moove e accedi ai tuoi vantaggi esclusivi.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm max-w-xl mx-auto">
          <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">Nessun NFT trovato</h2>
          <p className="text-neutral-600 max-w-sm mx-auto mb-6">
            Non possiedi ancora nessun NFT. Acquista un NFT dal marketplace o creane uno nuovo.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/marketplace" 
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Vai al marketplace
            </Link>
            <Link 
              to="/mint" 
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Crea un NFT
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nfts.map(nft => (
            <div key={nft.tokenId} className="bg-white/80 backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-neutral-200 hover:translate-y-[-4px]">
              <div className="relative">
                <img 
                  src={`https://picsum.photos/seed/${nft.tokenId}/400/300`} 
                  alt={`NFT ${nft.tokenId}`} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-xs font-medium">
                  #{nft.tokenId}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {nft.rarity} NFT
                  </h3>
                  <div className="px-2 py-1 bg-primary-100 rounded-lg">
                    <p className="text-xs font-medium text-primary-700">In tuo possesso</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <p className="text-xs text-neutral-500 w-24">Sconto:</p>
                    <p className="text-sm font-medium">{nft.discount}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-neutral-500 w-24">Applicato su:</p>
                    <p className="text-sm font-medium">{nft.discountOn}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-neutral-500 w-24">Valore:</p>
                    <p className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                      {ethers.utils.formatEther(nft.price)} ETH
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    to={`/rides`} 
                    className="flex-1 py-2 text-center bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Usa NFT
                  </Link>
                  <Link 
                    to={`/nft/${nft.tokenId}`} 
                    className="flex-1 py-2 text-center bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    Gestisci
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnedNFTs;