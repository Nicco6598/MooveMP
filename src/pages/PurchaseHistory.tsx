import React, { useEffect, useState, useContext } from 'react';
import { formatEther } from 'ethers';
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
    price: bigint;
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
                const signer = await provider.getSigner();
                const contract = getContract(provider);
                const tokenCount = await contract.nextTokenId();
                const address = await signer.getAddress();
                const purchaseHistory: PurchaseItem[] = [];

                for (let i = 0; i < Number(tokenCount); i++) {
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
                                    timestamp: Number(item.timestamp),
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
        <div className="min-h-screen">
            {/* Hero */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            Cronologia <span className="text-gradient">Transazioni</span>
                        </h1>
                        <p className="text-lg text-neutral-400 mb-8">
                            Visualizza lo storico delle tue transazioni di acquisto e vendita NFT.
                        </p>

                        <div className="inline-flex items-center gap-1 p-1 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === 'all' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Tutte
                            </button>
                            <button
                                onClick={() => setFilter('bought')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === 'bought' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Acquisti
                            </button>
                            <button
                                onClick={() => setFilter('sold')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === 'sold' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Vendite
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-800 border-t-accent-500"></div>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 max-w-xl mx-auto text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-800 flex items-center justify-center">
                            <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Nessuna transazione trovata</h2>
                        <p className="text-neutral-400 mb-8">
                            {filter === 'all'
                                ? 'Non hai ancora effettuato nessuna transazione.'
                                : filter === 'bought'
                                    ? 'Non hai ancora acquistato nessun NFT.'
                                    : 'Non hai ancora venduto nessun NFT.'}
                        </p>
                        <Link
                            to="/marketplace"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/20"
                        >
                            Esplora il marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {filteredHistory.map((item, index) => (
                            <div
                                key={`${item.tokenId}-${item.timestamp}-${index}`}
                                className="glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.status === PurchaseStatus.BOUGHT
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
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
                                                <h3 className="text-lg font-medium text-white">NFT #{item.tokenId}</h3>
                                                <p className="text-sm text-neutral-500">
                                                    {formatTimestamp(item.timestamp)} • {item.transactionType}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${item.status === PurchaseStatus.BOUGHT
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-accent-500/20 text-accent-400'
                                                }`}>
                                                {item.status}
                                            </div>
                                            <p className="text-lg font-bold mt-1 text-gradient">
                                                {formatEther(item.price)} ETH
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-neutral-800/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-neutral-500 mb-1">Venditore</p>
                                            <a
                                                href={`https://sepolia.etherscan.io/address/${item.seller}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-neutral-300 hover:text-accent-400 truncate block transition-colors"
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
                                                className="font-mono text-neutral-300 hover:text-accent-400 truncate block transition-colors"
                                            >
                                                {item.buyer}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Link
                                            to={`/nft/${item.tokenId}`}
                                            className="text-accent-400 hover:text-accent-300 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                                        >
                                            Visualizza NFT
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
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

export default PurchaseHistory;

