import React from 'react';
import { formatEther } from 'ethers';

export enum PurchaseStatus {
    BOUGHT = 'BOUGHT',
    SOLD = 'SOLD',
}

interface PurchaseItem {
    tokenId: number;
    buyer: string;
    seller: string;
    price: bigint;
    timestamp: number;
    status: PurchaseStatus;
}

const NFTCard: React.FC<PurchaseItem> = ({ tokenId, buyer, seller, price, timestamp, status }) => {
    return (
        <div className="bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] p-4">
            <p className={`text-sm font-bold bg-gradient-to-r ${status === PurchaseStatus.BOUGHT ? "from-green-500 to-teal-500" : "from-amber-500 to-red-500"} text-transparent bg-clip-text inline-block truncate`}>
                {new Date(timestamp * 1000).toLocaleDateString()}
            </p>
            <p></p>
            <p className={`text-xl font-bold bg-gradient-to-r ${status === PurchaseStatus.BOUGHT ? "from-green-500 to-teal-500" : "from-amber-500 to-red-500"} text-transparent bg-clip-text inline-block truncate`}>
                {status}
            </p>
            <p></p>
            <p className={`text-lg font-bold bg-gradient-to-r ${status === PurchaseStatus.BOUGHT ? "from-green-500 to-teal-500" : "from-amber-500 to-red-500"} text-transparent mb-2 bg-clip-text inline-block truncate`}>
                {formatEther(price)} ETH
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

export default NFTCard;


