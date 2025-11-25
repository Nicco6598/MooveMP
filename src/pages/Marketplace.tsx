import React, { useEffect, useState, useContext, useCallback } from 'react';
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
    isForSale: boolean;
}

const Marketplace: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { provider } = useContext(ProviderContext);

    useEffect(() => {
        const fetchNFTs = async () => {
            if (!provider) return;
            
            setLoading(true);
            const contract = getContract(provider);
            const items: NFT[] = [];
            try {
                const totalSupply = await contract.nextTokenId();
                for (let i = 0; i < Number(totalSupply); i++) {
                    const owner = await contract.ownerOf(i);
                    const tokenPrice = await contract.tokenPrices(i);
                    const tokenAttributes = await contract.getTokenAttributes(i);
                    const isForSale = await contract.isForSale(i);

                    const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => {
                        const cleanedAttr = attr.replace(/.*?:/, '').trim();
                        return cleanedAttr;
                    });

                    items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn, isForSale });
                }
                setNfts(items);
            } catch (error) {
                console.error("Error fetching NFTs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [provider]);

    const purchaseNFT = async (tokenId: number, price: bigint) => {
        if (!provider) return;
        
        try {
            const signer = await provider.getSigner();
            const contract = getContract(signer);
            await contract.purchaseNFT(tokenId, { value: price });
            // Aggiornamento dell'elenco degli NFT dopo l'acquisto
            const updatedNFTs = nfts.filter(nft => nft.tokenId !== tokenId);
            setNfts(updatedNFTs);
        } catch (error) {
            console.error('Errore durante l\'acquisto:', error);
        }
    };

    const filteredNfts = filter === 'all' 
        ? nfts 
        : filter === 'forSale' 
            ? nfts.filter(nft => nft.isForSale) 
            : nfts.filter(nft => !nft.isForSale);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
                            Esplora il <span className="text-gradient">Marketplace</span> NFT
                        </h1>
                        <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Acquista NFT unici che offrono sconti esclusivi per i servizi di mobilità urbana sostenibile.
                        </p>
                        
                        {/* Filter Pills */}
                        <div className="inline-flex items-center gap-1 p-1 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl">
                            <button 
                                onClick={() => setFilter('all')} 
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    filter === 'all' 
                                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' 
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                Tutti
                            </button>
                            <button 
                                onClick={() => setFilter('forSale')} 
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    filter === 'forSale' 
                                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' 
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                In vendita
                            </button>
                            <button 
                                onClick={() => setFilter('notForSale')} 
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    filter === 'notForSale' 
                                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' 
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                Non in vendita
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* NFT Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-800 border-t-accent-500"></div>
                        </div>
                    </div>
                ) : filteredNfts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
                                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-neutral-400">Nessun NFT disponibile con i filtri selezionati.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredNfts.map(nft => (
                            <div key={nft.tokenId} className="group glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow">
                                {/* Image */}
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
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                            nft.isForSale 
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                : 'bg-neutral-800/80 text-neutral-400 border border-neutral-700/50'
                                        }`}>
                                            {nft.isForSale ? 'In vendita' : 'Non in vendita'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Rarità</p>
                                            <p className="text-sm font-semibold text-white">{nft.rarity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500 mb-1">Sconto</p>
                                            <p className="text-sm font-semibold text-accent-400">{nft.discount}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                                        <p className="text-xs text-neutral-500 mb-1">Applicato su</p>
                                        <p className="text-sm text-neutral-200">{nft.discountOn}</p>
                                    </div>
                                    
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Prezzo</p>
                                            <p className="text-xl font-bold text-gradient">
                                                {formatEther(nft.price)} ETH
                                            </p>
                                        </div>
                                        <a 
                                            href={`https://sepolia.etherscan.io/address/${nft.owner}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs text-neutral-500 hover:text-accent-400 transition-colors font-mono"
                                        >
                                            {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                                        </a>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {nft.isForSale && (
                                            <button 
                                                onClick={() => purchaseNFT(nft.tokenId, nft.price)} 
                                                className="flex-1 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30"
                                            >
                                                Acquista
                                            </button>
                                        )}
                                        <Link 
                                            to={`/nft/${nft.tokenId}`} 
                                            className={`${nft.isForSale ? 'flex-1' : 'w-full'} py-2.5 text-center bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all`}
                                        >
                                            Dettagli
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

export default Marketplace;

