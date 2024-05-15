import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface PurchaseItem {
    tokenId: number;
    buyer: string;
    seller: string;
    price: ethers.BigNumber;
    timestamp: number;
    status: string;
}

const NFTCard: React.FC<PurchaseItem> = ({ tokenId, buyer, seller, price, timestamp, status }) => {
    return (
        <div className="bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform hover:scale-105 p-4">
            <p className={`text-sm font-bold bg-gradient-to-r ${status === "COMPRATO" ? "from-green-500 to-teal-500" : "from-amber-500 to-red-500"} text-transparent bg-clip-text inline-block truncate`}>
                {new Date(timestamp * 1000).toLocaleDateString()}
            </p>
            <p></p>
            <p className={`text-xl font-bold bg-gradient-to-r ${status === "COMPRATO" ? "from-green-500 to-teal-500" : "from-amber-500 to-red-500"} text-transparent bg-clip-text inline-block truncate`}>
                {status}
            </p>
            <p></p>
            <p className={`text-lg font-bold bg-gradient-to-r ${status === "COMPRATO" ? "from-green-500 to-teal-500" : "from-amber-500 to-red-500"} text-transparent mb-2 bg-clip-text inline-block truncate`}>
                {ethers.utils.formatEther(price)} ETH
            </p>
            <p className="text-gray-700 text-sm font-bold mb-1 truncate">Token ID: {tokenId}</p>
            <p className="text-gray-700 text-sm font-semibold mb-1 truncate">
                Buyer: <a href={`https://sepolia.etherscan.io/address/${buyer}`} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{buyer}</a>
            </p>
            <p className="text-gray-700 text-sm font-semibold mb-4 truncate">
                Seller: <a href={`https://sepolia.etherscan.io/address/${seller}`} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{seller}</a>
            </p>
        </div>
    );
};

const PurchaseHistory = () => {
    const [history, setHistory] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    useEffect(() => {
        const fetchHistory = async () => {
            const contract = getContract(provider);
            try {
                const tokenCount: ethers.BigNumber = await contract.nextTokenId();
                const address = await signer.getAddress();
                const purchaseHistory: PurchaseItem[] = [];
                const statuses: string[] = [];
                
                for (let i = 0; i < tokenCount.toNumber(); i++) {
                    // Ottieni lo stato dell'asta
                    const isAuctionActive = await contract.auctionEnds(i) > Date.now() / 1000;
                    
                    // Se l'asta per questo token non è attiva, aggiungi l'oggetto alla cronologia
                    if (!isAuctionActive) {
                        const tokenHistory: PurchaseItem[] = await contract.getPurchaseHistory(i);
                        for (const item of tokenHistory) {
                            let status = "";
                            if (address === item.buyer) {
                                status = "COMPRATO";
                            } else if (address === item.seller) {
                                status = "VENDUTO";
                            }
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
