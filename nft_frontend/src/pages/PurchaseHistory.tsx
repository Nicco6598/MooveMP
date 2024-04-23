import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface PurchaseItem {
    description: string;
    date: number; // assuming date is a timestamp
}

const PurchaseHistory = () => {
    const [history, setHistory] = useState<PurchaseItem[]>([]); // Use the interface here
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            try {
                const data: PurchaseItem[] = await contract.getPurchaseHistory();
                setHistory(data);
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
        <div className="min-h-screen flex flex-col items-center pt-8">
            <h1 className="text-xl font-semibold text-gray-900">Purchase History</h1>
            <ul className="mt-5 w-full max-w-3xl p-5 bg-white shadow rounded-lg">
                {history.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                        <span className="text-gray-700">{item.description}</span>
                        <span className="text-sm text-gray-500">{new Date(item.date * 1000).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PurchaseHistory;

