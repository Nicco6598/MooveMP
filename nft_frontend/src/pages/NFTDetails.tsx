import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface NFTDetailsProps {
    tokenId: number;
    owner: string;
    price: ethers.BigNumber;
    auctionDuration: number;
}

const NFTDetails: React.FC = () => {
    const { tokenId } = useParams<{ tokenId: string }>();
    const [details, setDetails] = useState<NFTDetailsProps | null>(null);
    const [newPrice, setNewPrice] = useState('');
    const [auctionDuration, setAuctionDuration] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (tokenId) {
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const owner = await contract.ownerOf(parseInt(tokenId));
                const price = await contract.getPrice(parseInt(tokenId));
                const auctionDuration = await contract.getAuctionDuration(parseInt(tokenId));

                setDetails({
                    tokenId: parseInt(tokenId),
                    owner,
                    price,
                    auctionDuration
                });
            }
        };

        fetchData();
    }, [tokenId]);

    const handleSetPrice = async () => {
        if (details && newPrice) {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
            const contract = getContract(signer);

            await contract.setPrice(details.tokenId, ethers.utils.parseEther(newPrice));
            alert('Prezzo impostato con successo!');
        }
    };

    const handleStartAuction = async () => {
        if (details && auctionDuration) {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
            const contract = getContract(signer);

            await contract.startAuction(details.tokenId, parseInt(auctionDuration) * 24 * 60 * 60);
            alert('Asta iniziata con successo!');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            {details && (
                <div className="bg-white rounded-lg p-8 shadow-lg">
                    <img
                        src={`https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                        alt={`NFT ${details.tokenId}`}
                        className="w-64 h-auto mb-4 rounded-lg"
                    />
                    <p>
                        <span className="font-bold">Token ID:</span> {details.tokenId}
                    </p>
                    <p>
                        <span className="italic">Owner:</span> {details.owner}
                    </p>
                    <p>
                        <span className="italic">Prezzo:</span> {ethers.utils.formatEther(details.price)} ETH
                    </p>
                    <p>
                        <span className="italic">Durata Asta:</span> {details.auctionDuration} giorni
                    </p>
                    <div>
                        <input
                            type="text"
                            placeholder="Imposta nuovo Prezzo in ETH"
                            value={newPrice}
                            onChange={e => setNewPrice(e.target.value)}
                            className="border p-2 mr-2"
                        />
                        <button onClick={handleSetPrice} className="bg-blue-500 text-white p-2">Imposta Prezzo</button>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Durata Asta in giorni"
                            value={auctionDuration}
                            onChange={e => setAuctionDuration(e.target.value)}
                            className="border p-2 mr-2"
                        />
                        <button onClick={handleStartAuction} className="bg-green-500 text-white p-2">Inizia Asta</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTDetails;
