import React, { useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

const MintNFT: React.FC = () => {
    const [price, setPrice] = useState('');
    const [rarity, setRarity] = useState('');
    const [discount, setDiscount] = useState('');
    const [discountOn, setDiscountOn] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const errors = [];
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            errors.push('Il prezzo deve essere un numero valido maggiore di 0');
        }
        if (!rarity.trim()) {
            errors.push('La rarità è obbligatoria');
        }
        if (!discount.trim()) {
            errors.push('La scontistica è obbligatoria');
        }
        if (!discountOn.trim()) {
            errors.push('Il campo "Sconto su" è obbligatorio');
        }
        setErrors(errors);
        return errors.length === 0;
    };

    const handleMint = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const contract = getContract(signer);
        try {
            const tx = await contract.createNFT(
                ethers.utils.parseEther(price),
                rarity,
                discount,
                discountOn
            );
            await tx.wait();
            setLoading(false);
            alert('NFT Mintato con successo!');
        } catch (error) {
            setLoading(false);
            console.error("Errore durante il minting:", error);
            alert('Errore nel minting dell\'NFT');
        }
    };

    return (
        <div className="p-5">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-purple-200 bg-opacity-55 backdrop-blur z-50">
                    <div className="bg-white p-6 rounded-lg border border-black shadow-[0px_0px_15px_5px_#0f0f0f] flex flex-col items-center">
                        <p className="text-xl text-purple-500 font-bold mb-4">Attendi il minting dell'NFT...</p>
                        <img src="https://i.gifer.com/yy3.gif" alt="Loading..." className="h-20 w-20" />
                    </div>
                </div>
            )}
            <h1 className="mb-12 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">MINT NFT</h1>
            <div className="flex justify-center items-center">
                <div className="p-8 bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] max-w-md w-full">
                    {errors.length > 0 && (
                        <div className="mb-4">
                            {errors.map((error, index) => (
                                <p key={index} className="text-red-500 text-sm">{error}</p>
                            ))}
                        </div>
                    )}
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
        </div>
    );
};

export default MintNFT;
