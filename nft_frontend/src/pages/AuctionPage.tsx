import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFT {
    tokenId: number;
    owner: string;
    price: ethers.BigNumber;
    rarity: string;
    discount: string;
    discountOn: string;
    auctionEnd: number;
    highestBid: ethers.BigNumber;
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
                
                for (let i = 0; i < totalSupply.toNumber(); i++) {
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
                            auctionEnd: auctionEnd.toNumber(),
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
                    Aste Attive
                </h1>
                <p className="text-neutral-600 max-w-2xl text-center mb-6">
                    Partecipa alle aste in corso per aggiudicarti NFT esclusivi con vantaggi unici.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : nfts.length === 0 ? (
                <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm max-w-xl mx-auto">
                    <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-neutral-700 mb-2">Nessuna asta attiva</h2>
                    <p className="text-neutral-600 max-w-sm mx-auto mb-6">
                        Non ci sono aste attive al momento. Torna più tardi o esplora il marketplace per acquisti diretti.
                    </p>
                    <Link 
                        to="/marketplace" 
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Esplora il marketplace
                    </Link>
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
                                <div className="absolute top-3 left-3 px-2 py-1 bg-accent-500 text-white rounded-lg text-xs font-medium">
                                    Asta
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-1">{nft.rarity} NFT</h3>
                                    <p className="text-sm text-neutral-600 truncate">
                                        Proprietario: {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
                                    </p>
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
                                </div>
                                
                                <div className="bg-primary-50 rounded-xl p-3 mb-4 border border-primary-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-medium text-primary-700">Offerta attuale</p>
                                        <p className="text-sm font-bold text-primary-700">
                                            {ethers.utils.formatEther(nft.highestBid.gt(0) ? nft.highestBid : nft.price)} ETH
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-medium text-primary-700">Tempo rimanente</p>
                                        <p className="text-sm font-mono text-primary-800">
                                            {timeRemaining[nft.tokenId] || 'Caricamento...'}
                                        </p>
                                    </div>
                                </div>
                                
                                <Link 
                                    to={`/nft/${nft.tokenId}`} 
                                    className="w-full py-2 flex justify-center items-center bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Fai un'offerta
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuctionPage;