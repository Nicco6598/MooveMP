import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFT {
  tokenId: number;
  owner: string;
  price: bigint;
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
        const signer = await provider.getSigner();
        const contract = getContract(provider);
        const totalSupply = await contract.nextTokenId();
        const items: NFT[] = [];
        
        for (let i = 0; i < Number(totalSupply); i++) {
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
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              I Miei <span className="text-gradient">NFT</span>
            </h1>
            <p className="text-lg text-neutral-400">
              Gestisci la tua collezione e accedi ai tuoi vantaggi esclusivi.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-800 border-t-accent-500"></div>
          </div>
        ) : nfts.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Nessun NFT trovato</h2>
            <p className="text-neutral-400 mb-8">
              Non possiedi ancora nessun NFT. Acquista dal marketplace o creane uno nuovo.
            </p>
            <div className="flex gap-3 justify-center">
              <Link 
                to="/marketplace" 
                className="px-5 py-2.5 bg-neutral-800 text-neutral-200 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-all"
              >
                Vai al marketplace
              </Link>
              <Link 
                to="/mint" 
                className="px-5 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/20"
              >
                Crea un NFT
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nfts.map(nft => (
              <div key={nft.tokenId} className="group glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${nft.tokenId}/400/300`} 
                    alt={`NFT ${nft.tokenId}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-neutral-900/80 backdrop-blur-sm rounded-lg text-xs font-mono text-neutral-300 border border-neutral-700/50">
                    #{nft.tokenId}
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-accent-500/20 text-accent-400 rounded-lg text-xs font-medium border border-accent-500/30">
                    In tuo possesso
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{nft.rarity}</h3>
                    <p className="text-sm font-semibold text-accent-400">{nft.discount}</p>
                  </div>
                  
                  <div className="mb-4 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                    <p className="text-xs text-neutral-500 mb-1">Applicato su</p>
                    <p className="text-sm text-neutral-200">{nft.discountOn}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Valore</p>
                      <p className="text-lg font-bold text-gradient">{formatEther(nft.price)} ETH</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      to="/rides" 
                      className="flex-1 py-2.5 text-center bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-accent-500/20"
                    >
                      Usa NFT
                    </Link>
                    <Link 
                      to={`/nft/${nft.tokenId}`} 
                      className="flex-1 py-2.5 text-center bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl border border-neutral-700 transition-all"
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
    </div>
  );
};

export default OwnedNFTs;

