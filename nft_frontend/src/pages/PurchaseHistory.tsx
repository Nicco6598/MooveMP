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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    useEffect(() => {
        const fetchHistory = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            try {
                const tokenCount: ethers.BigNumber = await contract.nextTokenId();
                const purchaseHistory: PurchaseItem[] = [];
                for (let i = 0; i < tokenCount.toNumber(); i++) {
                    const owner = await contract.ownerOf(i);
                    if (owner === await signer.getAddress()) {
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

    if (loading) return <p className="mt-16 flex flex-col items-center pt-8">Loading...</p>;

    return (
        <div className="p-5">
            <h1 className="mb-16 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">PURCHASE HISTORY</h1>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5 w-full max-w-3xl">
                {history.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform hover:scale-105 p-4">
                        <p className="text-gray-700 text-sm font-bold mb-1 truncate">Token ID: {item.tokenId}</p>
                        <p className="text-gray-700 text-sm font-semibold mb-1 truncate">
                            Buyer: <a href={`https://sepolia.etherscan.io/address/${item.buyer}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.buyer}</a>
                        </p>
                        <p className="text-gray-700 text-sm font-semibold mb-4 truncate">
                            Seller: <a href={`https://sepolia.etherscan.io/address/${item.seller}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.seller}</a>
                        </p>
                        <p className="text-gray-700 text-m font-semibold text-purple-700 mb-1 truncate">Price: {ethers.utils.formatEther(item.price)}</p>
                        <p className="text-gray-500 text-xs bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block truncate">Date: {new Date(item.timestamp * 1000).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurchaseHistory;