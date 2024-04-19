import React, { useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

const MintNFT: React.FC = () => {
    const [price, setPrice] = useState('');
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();

    const handleMint = async () => {
        const contract = getContract(signer);
        try {
            const tx = await contract.createNFT(ethers.utils.parseEther(price));
            await tx.wait();
            alert('NFT Mintato con successo!');
        } catch (error) {
            console.error("Errore durante il minting:", error);
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-5">Mint NFT</h1>
            <input
                type="text"
                placeholder="Prezzo in ETH"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="border p-2 rounded-2xl"
            />
            <button onClick={handleMint} className="bg-purple-500 ml-4 text-white p-2 text-white text-center py-2 px-6 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-amber-600 transition-all duration-300 ease-in-out transform hover:scale-105">Mint</button>
        </div>
    );
};

export default MintNFT;
