import React, { useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

const NFTDetails: React.FC<{ tokenId: number }> = ({ tokenId }) => {
    const [price, setPrice] = useState('');
    const [days, setDays] = useState('');
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();

    const handleSetPrice = async () => {
        const contract = getContract(signer);
        await contract.setPrice(tokenId, ethers.utils.parseEther(price));
        alert('Prezzo impostato con successo!');
    };

    const handleStartAuction = async () => {
        const contract = getContract(signer);
        await contract.startAuction(tokenId, parseInt(days) * 24 * 60 * 60);
        alert('Asta iniziata con successo!');
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-5">Dettagli NFT #{tokenId}</h1>
            <input
                type="text"
                placeholder="Imposta Prezzo in ETH"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="border p-2 mr-2"
            />
            <button onClick={handleSetPrice} className="bg-blue-500 text-white p-2">Imposta Prezzo</button>

            <input
                type="text"
                placeholder="Durata Asta in giorni"
                value={days}
                onChange={e => setDays(e.target.value)}
                className="border p-2 mr-2"
            />
            <button onClick={handleStartAuction} className="bg-green-500 text-white p-2">Inizia Asta</button>
        </div>
    );
};

export default NFTDetails;
