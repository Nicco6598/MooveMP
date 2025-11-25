import React, { useEffect, useState, useContext } from 'react';
import { formatEther } from 'ethers';
import { Link } from 'react-router-dom';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFT {
    tokenId: number;
    owner: string;
    price: bigint;
    rarity: string;
    discount: string;
    discountOn: string;
    auctionEnd: number;
    highestBid: bigint;
}

const AuctionPage: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(true);
    const { provider } = useContext(ProviderContext);
    const [timeRemaining, setTimeRemaining] = useState<{[key: number]: string}>({});

    useEffect(() => {
        const fetchAuctionNFTs = async () => {
            if (!provider) return;

            try {
                setLoading(true);
                const contract = getContract(provider);
                const items: NFT[] = [];
                const totalSupply = await contract.nextTokenId();
                
                for (let i = 0; i < Number(totalSupply); i++) {
                    const auctionEnd = await contract.auctionEnds(i);
                    
                    // Verifica se l'asta è ancora attiva
                    if (auctionEnd > Math.floor(Date.now() / 1000)) {
                        const owner = await contract.ownerOf(i);
                        const tokenPrice = await contract.tokenPrices(i);
                        const highestBid = await contract.highestBid(i);
                        const tokenAttributes = await contract.getTokenAttributes(i);
                        
                        // Parse attributes
                        const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => {
                            const cleanedAttr = attr.replace(/.*?:/, '').trim();
                            return cleanedAttr;
                        });
                        
                        items.push({ 
                            tokenId: i, 
                            owner, 
                            price: tokenPrice, 
                            rarity, 
                            discount, 
                            discountOn, 
                            auctionEnd: Number(auctionEnd),
                            highestBid
                        });
                    }
                }
                
                setNfts(items);
            } catch (error) {
                console.error("Error fetching auction NFTs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctionNFTs();
    }, [provider]);

    useEffect(() => {
        // Aggiorna il tempo rimanente ogni secondo
        const intervalId = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const updatedTimeRemaining: {[key: number]: string} = {};
            
            nfts.forEach(nft => {
                const timeRemaining = nft.auctionEnd - now;
                if (timeRemaining <= 0) {
                    updatedTimeRemaining[nft.tokenId] = 'Asta scaduta';
                } else {
                    const days = Math.floor(timeRemaining / (3600 * 24));
                    const hours = Math.floor((timeRemaining % (3600 * 24)) / 3600);
                    const minutes = Math.floor((timeRemaining % 3600) / 60);
                    const seconds = timeRemaining % 60;
                    updatedTimeRemaining[nft.tokenId] = `${days}g ${hours}h ${minutes}m ${seconds}s`;
                }
            });
            
            setTimeRemaining(updatedTimeRemaining);
        }, 1000);
        
        return () => clearInterval(intervalId);
    }, [nfts]);

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Live
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            Aste <span className="text-gradient">Attive</span>
                        </h1>
                        <p className="text-lg text-neutral-400">
                            Partecipa alle aste in corso per aggiudicarti NFT esclusivi con vantaggi unici.
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Nessuna asta attiva</h2>
                        <p className="text-neutral-400 mb-8">
                            Non ci sono aste attive al momento. Torna più tardi o esplora il marketplace.
                        </p>
                        <Link 
                            to="/marketplace" 
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/20"
                        >
                            Esplora il marketplace
                        </Link>
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
                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/30 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                        Asta Live
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-white">{nft.rarity}</h3>
                                        <p className="text-sm font-semibold text-accent-400">{nft.discount}</p>
                                    </div>
                                    
                                    <p className="text-xs text-neutral-500 mb-4 font-mono">
                                        {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
                                    </p>
                                    
                                    {/* Auction Info */}
                                    <div className="bg-accent-500/10 rounded-xl p-4 mb-4 border border-accent-500/20">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-xs text-neutral-400">Offerta attuale</p>
                                            <p className="text-lg font-bold text-gradient">
                                                {formatEther(nft.highestBid > 0n ? nft.highestBid : nft.price)} ETH
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-neutral-400">Tempo rimanente</p>
                                            <p className="text-sm font-mono text-white">
                                                {timeRemaining[nft.tokenId] || '...'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Link 
                                        to={`/nft/${nft.tokenId}`} 
                                        className="w-full py-2.5 flex justify-center items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-accent-500/20"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Fai un'offerta
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionPage;

