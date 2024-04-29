import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface PurchaseItem {
    tokenId: number;
    buyer: string;
    seller: string;
    price: ethers.BigNumber;
    timestamp: number; // assuming timestamp is a number
}

const PurchaseHistory = () => {
    const [history, setHistory] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            try {
                const tokenCount: ethers.BigNumber = await contract.nextTokenId();
                const purchaseHistory: PurchaseItem[] = [];
                for (let i = 0; i < tokenCount.toNumber(); i++) {
                    const tokenHistory: PurchaseItem[] = await contract.getPurchaseHistory(i);
                    tokenHistory.forEach((item) => {
                        purchaseHistory.push({
                            tokenId: i,
                            buyer: item.buyer,
                            seller: item.seller,
                            price: item.price,
                            timestamp: item.timestamp
                        });
                    });
                }
                setHistory(purchaseHistory);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch purchase history", error);
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-5">
            <h1 className="mb-16 flex flex-col items-center pt-8">PURCHASE HISTORY</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5 w-full max-w-3xl">
                {history.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
                        <p className="text-gray-700 text-sm font-bold mb-1 truncate">Token ID: {item.tokenId}</p>
                        <p className="text-gray-700 text-sm font-semibold mb-1 truncate">
                            Buyer: <a href={`https://sepolia.etherscan.io/address/${item.buyer}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.buyer}</a>
                        </p>
                        <p className="text-gray-700 text-sm font-semibold mb-1 truncate">
                            Seller: <a href={`https://sepolia.etherscan.io/address/${item.seller}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.seller}</a>
                        </p>
                        <p className="text-gray-700 text-sm font-semibold mb-4 truncate">Price: {ethers.utils.formatEther(item.price)}</p>
                        <p className="text-gray-500 text-xs text-orange-500 truncate">Date: {new Date(item.timestamp * 1000).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurchaseHistory;
