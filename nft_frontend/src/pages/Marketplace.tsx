import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface NFT {
    tokenId: number;
    owner: string;
    price: ethers.BigNumber;
    rarity: string;
    discount: string;
    discountOn: string;
    isForSale: boolean;
}

const Marketplace: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    useEffect(() => {
        const fetchNFTs = async () => {
            setLoading(true);
            const contract = getContract(provider);
            const items: NFT[] = [];
            try {
                const totalSupply = await contract.nextTokenId();
                for (let i = 0; i < totalSupply.toNumber(); i++) {
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
    }, []);

    const purchaseNFT = async (tokenId: number, price: ethers.BigNumber) => {
        try {
            const signer = provider.getSigner();
            const contract = getContract(provider);
            await contract.connect(signer).purchaseNFT(tokenId, { value: price });
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
                    Marketplace NFT
                </h1>
                <p className="text-neutral-600 max-w-2xl text-center mb-6">
                    Esplora e acquista NFT unici che offrono sconti esclusivi per i servizi di mobilità Moove.
                </p>
                
                <div className="flex space-x-2 bg-neutral-100 p-1 rounded-xl mb-8">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'all' ? 'bg-white shadow text-primary-700' : 'text-neutral-600 hover:bg-white/50'
                        }`}
                    >
                        Tutti
                    </button>
                    <button 
                        onClick={() => setFilter('forSale')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'forSale' ? 'bg-white shadow text-primary-700' : 'text-neutral-600 hover:bg-white/50'
                        }`}
                    >
                        In vendita
                    </button>
                    <button 
                        onClick={() => setFilter('notForSale')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'notForSale' ? 'bg-white shadow text-primary-700' : 'text-neutral-600 hover:bg-white/50'
                        }`}
                    >
                        Non in vendita
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : filteredNfts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-neutral-600">Nessun NFT disponibile con i filtri selezionati.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredNfts.map(nft => (
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
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-1">Proprietario</p>
                                        <a 
                                            href={`https://sepolia.etherscan.io/address/${nft.owner}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs text-primary-600 hover:underline"
                                        >
                                            {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                                        </a>
                                    </div>
                                    <div className="px-2 py-1 bg-primary-100 rounded-lg">
                                        <p className="text-xs font-medium text-primary-700">{nft.rarity}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center">
                                        <p className="text-xs text-neutral-500 w-20">Sconto:</p>
                                        <p className="text-sm font-medium">{nft.discount}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <p className="text-xs text-neutral-500 w-20">Applicato su:</p>
                                        <p className="text-sm font-medium">{nft.discountOn}</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-xs text-neutral-500">Prezzo</p>
                                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                                            {ethers.utils.formatEther(nft.price)} ETH
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 text-right">Stato</p>
                                        <p className={`text-sm font-medium ${nft.isForSale ? 'text-green-500' : 'text-neutral-500'}`}>
                                            {nft.isForSale ? 'In vendita' : 'Non in vendita'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    {nft.isForSale && (
                                        <button 
                                            onClick={() => purchaseNFT(nft.tokenId, nft.price)} 
                                            className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                                        >
                                            Compra
                                        </button>
                                    )}
                                    <Link 
                                        to={`/nft/${nft.tokenId}`} 
                                        className={`${nft.isForSale ? 'flex-1' : 'w-full'} py-2 text-center bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-200 transition-colors`}
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
    );
};

export default Marketplace;