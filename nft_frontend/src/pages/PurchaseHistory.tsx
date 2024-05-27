import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';
import NFTCard, { PurchaseStatus } from './NFTCard';

interface PurchaseItem {
    tokenId: number;
    buyer: string;
    seller: string;
    price: ethers.BigNumber;
    timestamp: number;
    status: PurchaseStatus;
}

const PurchaseHistory = () => {
    const [history, setHistory] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { provider } = useContext(ProviderContext);
    const signer = provider?.getSigner();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!signer || !provider) return;

            const contract = getContract(provider);
            try {
                const tokenCount: ethers.BigNumber = await contract.nextTokenId();
                const address = await signer.getAddress();
                const purchaseHistory: PurchaseItem[] = [];
                const statuses: PurchaseStatus[] = [];
                
                for (let i = 0; i < tokenCount.toNumber(); i++) {
                    // Ottieni lo stato dell'asta
                    const isAuctionActive = await contract.auctionEnds(i) > Date.now() / 1000;
                    
                    // Se l'asta per questo token non è attiva, aggiungi l'oggetto alla cronologia
                    if (!isAuctionActive) {
                        const tokenHistory: PurchaseItem[] = await contract.getPurchaseHistory(i);
                        for (const item of tokenHistory) {
                            let status: PurchaseStatus | undefined = undefined;
                            if (address === item.buyer) {
                                status = PurchaseStatus.BOUGHT;
                            } else if (address === item.seller) {
                                status = PurchaseStatus.SOLD;
                            }
                            if (status) {
                                statuses.push(status);
                                purchaseHistory.push({
                                    tokenId: i,
                                    buyer: item.buyer,
                                    seller: item.seller,
                                    price: item.price,
                                    timestamp: item.timestamp,
                                    status: status
                                });
                            }
                        }
                    }
                }
                
                setHistory(purchaseHistory.map((item, index) => ({
                    ...item,
                    status: statuses[index]
                })));
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch purchase history", error);
                setLoading(false);
            }
        };
    
        fetchHistory();
    }, [provider, signer]);

    if (loading) return <p className="mt-16 flex flex-col items-center pt-8">Loading...</p>;

    return (
        <div className="flex justify-center items-center mt-4 mb-12 flex-col">
            <h1 className="mb-12 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">PURCHASE HISTORY</h1>
            <div className="grid flex flex-col items-center grid-cols-1 gap-8 mt-5 w-auto max-w-3xl">
            {history
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((item, index) => (
                    <NFTCard key={index} {...item} />
                ))}
            </div>
        </div>
    );
};

export default PurchaseHistory;
