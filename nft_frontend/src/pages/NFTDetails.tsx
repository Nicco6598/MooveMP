import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface NFTDetailsProps {
    tokenId: number;
    owner: string;
    price: ethers.BigNumber;
    auctionDuration: number;
    highestBid: ethers.BigNumber;
    highestBidder: string;
}

const NFTDetails: React.FC = () => {
    const { tokenId } = useParams<{ tokenId: string }>();
    const [details, setDetails] = useState<NFTDetailsProps | null>(null);
    const [newPrice, setNewPrice] = useState('');
    const [auctionDuration, setAuctionDuration] = useState('');

    const formatDuration = (durationInSeconds: number) => {
        const days = Math.floor(durationInSeconds / (24 * 3600));
        const hours = Math.floor((durationInSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
    
        return `${days} giorni, ${hours} ore, ${minutes} minuti, ${seconds} secondi`;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (tokenId) {
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const owner = await contract.ownerOf(parseInt(tokenId));
                const price = await contract.getPrice(parseInt(tokenId));
                const highestBid = await contract.highestBid(parseInt(tokenId));
                const highestBidder = await contract.highestBidder(parseInt(tokenId));
                const isAuctionActive = await contract.auctionEnds(parseInt(tokenId)) > Date.now() / 1000;

                let auctionDuration = 0;
                if (isAuctionActive) {
                    auctionDuration = await contract.getAuctionDuration(parseInt(tokenId));
                }

                setDetails({
                    tokenId: parseInt(tokenId),
                    owner,
                    price,
                    auctionDuration,
                    highestBid,
                    highestBidder
                });
            }
        };

        fetchData();
    }, [tokenId]);

    const handleStartAuction = async () => {
        if (details && auctionDuration) {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
            const contract = getContract(signer);
    
            await contract.startAuction(details.tokenId, parseInt(auctionDuration));
            alert('Asta iniziata con successo!');
        }
    };

    const handleSetPrice = async () => {
        if (details && newPrice) {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
            const contract = getContract(signer);

            await contract.setPrice(details.tokenId, ethers.utils.parseEther(newPrice));
            alert('Prezzo impostato con successo!');
        }
    };

    const handleBid = async () => {
        if (details && newPrice) {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
            const contract = getContract(signer);

            await contract.bid(details.tokenId, { value: ethers.utils.parseEther(newPrice) });
            alert('Offerta effettuata con successo!');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen flex-col">
            {details && (
                <>
                    <div className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform p-4 mb-8">
                        <div className="flex">
                            <img
                                src={`https://images.unsplash.com/photo-1707344088547-3cf7cea5ca49?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                                alt={`NFT ${details.tokenId}`}
                                className="w-64 h-auto rounded-lg mr-8"
                            />
                            <div className="flex flex-col justify-between">
                                <div>
                                    <p className='mb-6'>
                                        <span className="font-bold">Token ID:</span> {details.tokenId}
                                    </p>
                                    <p>
                                        <span className="font-bold">Owner:</span> {`${details.owner.slice(0, 6)}...${details.owner.slice(-4)}`}
                                    </p>
                                    <p className="text-orange-600 font-bold mt-6 mb-6">
                                        <span>Prezzo Attuale:</span> {ethers.utils.formatEther(details.price)} ETH
                                    </p>
                                    <p  className="font-bold text-sky-600">
                                         <span>Durata Asta:</span> {details.auctionDuration > 0 ? formatDuration(details.auctionDuration) : 'Asta non attiva'}
                                    </p>
                                </div>
                                <div className="flex items-center mt-4">
                                    {details.auctionDuration > 0 && (
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                placeholder="Offri un prezzo in ETH"
                                                value={newPrice}
                                                onChange={e => setNewPrice(e.target.value)}
                                                className="border p-3 rounded-xl w-full"
                                            />
                                            <button onClick={handleBid} className="bg-purple-500 text-white p-3 w-40 rounded-xl hover:bg-purple-700 transition-colors duration-300 ml-2 mr-2">Bid</button>
                                        </div>
                                    )}
                                    {details.auctionDuration === 0 && (
                                        <div className="flex items-center mr-4">
                                            <input
                                                type="text"
                                                placeholder="Imposta nuovo Prezzo in ETH"
                                                value={newPrice}
                                                onChange={e => setNewPrice(e.target.value)}
                                                className="border p-3 rounded-xl w-full"
                                            />
                                            <button onClick={handleSetPrice} className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-700 transition-colors duration-300 ml-2 mr-2">Imposta Prezzo</button>
                                        </div>
                                    )}
                                    {details.auctionDuration === 0 && (
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            placeholder="Durata Asta in giorni"
                                            value={auctionDuration}
                                            onChange={e => setAuctionDuration(e.target.value)}
                                            className="border p-3 rounded-xl w-full"
                                        />
                                        <button onClick={handleStartAuction} className="bg-sky-500 text-white p-3 rounded-xl hover:bg-sky-700 transition-colors duration-300 ml-2 mr-2">Inizia Asta</button>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold mb-2">Miglior Offerta:</div>
                        <div className="text-xl mb-2">{ethers.utils.formatEther(details.highestBid)} ETH</div>
                        <div className="text-lg font-bold mb-2">Miglior Offerente:</div>
                        <div className={details.highestBidder === window.ethereum.selectedAddress ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>
                            {details.highestBidder === window.ethereum.selectedAddress ? 'Tu' : details.highestBidder}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NFTDetails;
