import React, { useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

const MintNFT: React.FC = () => {
    const [price, setPrice] = useState('');
    const [rarity, setRarity] = useState('');
    const [discount, setDiscount] = useState('');
    const [discountOn, setDiscountOn] = useState('');
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();

    const handleMint = async () => {
        const contract = getContract(signer);
        try {
            const tx = await contract.createNFT(
                ethers.utils.parseEther(price),
                rarity,
                discount,
                discountOn
            );
            await tx.wait();
            alert('NFT Mintato con successo!');
        } catch (error) {
            console.error("Errore durante il minting:", error);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="p-8 bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_20px_10px_#e9d8fd] transition-all duration-300 ease-in-out transform hover:scale-105 max-w-md w-full">
                <h1 className="text-2xl font-bold mb-5 text-center">MINT NFT</h1>
                <input
                    type="text"
                    placeholder="Prezzo in ETH"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="border p-3 rounded-xl mb-4 w-full text-center"
                />
                <input
                    type="text"
                    placeholder="Rarità"
                    value={rarity}
                    onChange={e => setRarity(e.target.value)}
                    className="border p-3 rounded-xl mb-4 w-full text-center"
                />
                <input
                    type="text"
                    placeholder="Scontistica"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    className="border p-3 rounded-xl mb-4 w-full text-center"
                />
                <input
                    type="text"
                    placeholder="Sconto su"
                    value={discountOn}
                    onChange={e => setDiscountOn(e.target.value)}
                    className="border p-3 rounded-xl mb-4 w-full text-center"
                />
                <button
                    onClick={handleMint}
                    className="bg-purple-500 text-white p-3 rounded-xl text-center w-full hover:bg-emerald-500 transition-all duration-300 ease-in-out text-center"
                >
                    Mint
                </button>
            </div>
        </div>
    );
};

export default MintNFT;
