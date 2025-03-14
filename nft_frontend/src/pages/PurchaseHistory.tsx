import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';
import { Link } from 'react-router-dom';

export enum PurchaseStatus {
    BOUGHT = 'ACQUISTATO',
    SOLD = 'VENDUTO',
}

interface PurchaseItem {
    tokenId: number;
    buyer: string;
    seller: string;
    price: ethers.BigNumber;
    timestamp: number;
    status: PurchaseStatus;
    transactionType: string;
}

const PurchaseHistory: React.FC = () => {
    const [history, setHistory] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'bought' | 'sold'>('all');
    const { provider } = useContext(ProviderContext);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!provider) return;

            try {
                setLoading(true);
                const signer = provider.getSigner();
                const contract = getContract(provider);
                const tokenCount: ethers.BigNumber = await contract.nextTokenId();
                const address = await signer.getAddress();
                const purchaseHistory: PurchaseItem[] = [];
                
                for (let i = 0; i < tokenCount.toNumber(); i++) {
                    // Verifica se l'asta per questo token non è attiva
                    const isAuctionActive = await contract.auctionEnds(i) > Date.now() / 1000;
                    
                    if (!isAuctionActive) {
                        const tokenHistory = await contract.getPurchaseHistory(i);
                        
                        for (const item of tokenHistory) {
                            let status: PurchaseStatus | undefined = undefined;
                            
                            if (address.toLowerCase() === item.buyer.toLowerCase()) {
                                status = PurchaseStatus.BOUGHT;
                            } else if (address.toLowerCase() === item.seller.toLowerCase()) {
                                status = PurchaseStatus.SOLD;
                            }
                            
                            if (status) {
                                purchaseHistory.push({
                                    tokenId: i,
                                    buyer: item.buyer,
                                    seller: item.seller,
                                    price: item.price,
                                    timestamp: item.timestamp.toNumber(),
                                    status: status,
                                    transactionType: item.transactionType
                                });
                            }
                        }
                    }
                }
                
                // Ordina per timestamp (più recenti prima)
                const sortedHistory = purchaseHistory.sort((a, b) => b.timestamp - a.timestamp);
                setHistory(sortedHistory);
            } catch (error) {
                console.error("Failed to fetch purchase history", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchHistory();
    }, [provider]);

    const filteredHistory = filter === 'all' 
        ? history 
        : filter === 'bought' 
            ? history.filter(item => item.status === PurchaseStatus.BOUGHT)
            : history.filter(item => item.status === PurchaseStatus.SOLD);

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
                    Cronologia Transazioni
                </h1>
                <p className="text-neutral-600 max-w-2xl text-center mb-6">
                    Visualizza lo storico delle tue transazioni di acquisto e vendita NFT.
                </p>

                <div className="flex space-x-2 bg-neutral-100 p-1 rounded-xl mb-4 self-center">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'all' ? 'bg-white shadow text-primary-700' : 'text-neutral-600 hover:bg-white/50'
                        }`}
                    >
                        Tutte
                    </button>
                    <button 
                        onClick={() => setFilter('bought')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'bought' ? 'bg-white shadow text-primary-700' : 'text-neutral-600 hover:bg-white/50'
                        }`}
                    >
                        Acquisti
                    </button>
                    <button 
                        onClick={() => setFilter('sold')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'sold' ? 'bg-white shadow text-primary-700' : 'text-neutral-600 hover:bg-white/50'
                        }`}
                    >
                        Vendite
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm max-w-xl mx-auto">
                    <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h2 className="text-xl font-semibold text-neutral-700 mb-2">Nessuna transazione trovata</h2>
                    <p className="text-neutral-600 max-w-sm mx-auto mb-6">
                        {filter === 'all' 
                            ? 'Non hai ancora effettuato nessuna transazione di acquisto o vendita.' 
                            : filter === 'bought' 
                                ? 'Non hai ancora acquistato nessun NFT.' 
                                : 'Non hai ancora venduto nessun NFT.'}
                    </p>
                    <Link 
                        to="/marketplace" 
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Esplora il marketplace
                    </Link>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-4">
                        {filteredHistory.map((item, index) => (
                            <div 
                                key={`${item.tokenId}-${item.timestamp}-${index}`} 
                                className="bg-white/80 backdrop-blur-lg rounded-xl overflow-hidden border border-neutral-200 transition-all duration-300 hover:shadow-md"
                            >
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                item.status === PurchaseStatus.BOUGHT 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-accent-100 text-accent-600'
                                            }`}>
                                                {item.status === PurchaseStatus.BOUGHT ? (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-lg font-medium">NFT #{item.tokenId}</h3>
                                                <p className="text-sm text-neutral-500">
                                                    {formatTimestamp(item.timestamp)} • {item.transactionType}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end">
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                item.status === PurchaseStatus.BOUGHT 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-accent-100 text-accent-700'
                                            }`}>
                                                {item.status}
                                            </div>
                                            <p className="text-lg font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                                                {ethers.utils.formatEther(item.price)} ETH
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-neutral-500 mb-1">Venditore</p>
                                            <a 
                                                href={`https://sepolia.etherscan.io/address/${item.seller}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-primary-600 hover:underline truncate block"
                                            >
                                                {item.seller}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-neutral-500 mb-1">Acquirente</p>
                                            <a 
                                                href={`https://sepolia.etherscan.io/address/${item.buyer}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-primary-600 hover:underline truncate block"
                                            >
                                                {item.buyer}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex justify-end">
                                        <Link 
                                            to={`/nft/${item.tokenId}`}
                                            className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                                        >
                                            Visualizza NFT
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;