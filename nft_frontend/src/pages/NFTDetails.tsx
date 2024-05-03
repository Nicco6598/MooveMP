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

            await contract.sale(details.tokenId, ethers.utils.parseEther(newPrice));
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
        <div className="flex justify-center items-center mt-4 flex-col">
            <h1 className="mb-6 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block text-2xl">NFT DETAILS</h1>
            {details && (
                <div className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform p-4 mb-8 flex flex-wrap">
                    <div className="w-full md:w-1/2 mb-4 md:mb-0">
                        <img
                            src={`https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                            alt={`NFT ${details.tokenId}`}
                            className="w-auto h-full rounded-lg mb-4"
                        />
                    </div>
                    <div className="w-full md:w-1/2 pl-0 md:pl-4">
                        <div className="mb-6">
                            <p>
                                <span className="font-bold">Token ID:</span> {details.tokenId}
                            </p>
                            <p className="text-gray-900 text-m font-bold mb-1 truncate">
                                Owner: <a href={`https://sepolia.etherscan.io/address/${details.owner}`} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{details.owner.slice(0, 7)}...{details.owner.slice(-5)}</a>
                            </p>
                        </div>
                        <div className="mb-6">
                            <p className="bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block text-m font-bold">
                                <span>Prezzo Attuale:</span> {ethers.utils.formatEther(details.price)} ETH
                            </p>
                            <p className="font-bold text-red-500 text-sm">
                                <span>Durata Asta:</span> {details.auctionDuration > 0 ? formatDuration(details.auctionDuration) : 'Asta non attiva'}
                            </p>
                        </div>
                        {details.auctionDuration > 0 && (
                            <div className="flex items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Offri un prezzo in ETH"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    className="border p-3 rounded-xl w-full"
                                />
                                <button onClick={handleBid} className="bg-purple-500 text-white p-3 w-full rounded-xl mt-2 hover:bg-purple-700 transition-colors duration-300">Bid</button>
                            </div>
                        )}
                        {details.auctionDuration === 0 && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Prezzo ETH"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    className="border p-3 rounded-xl w-full mb-4"
                                />
                                <input
                                    type="text"
                                    placeholder="Durata Asta in giorni"
                                    value={auctionDuration}
                                    onChange={e => setAuctionDuration(e.target.value)}
                                    className="border p-3 rounded-xl w-full mb-4"
                                />
                                <button onClick={handleSetPrice} className="bg-orange-500 text-white p-3 rounded-xl w-full mb-4 hover:bg-orange-700 transition-colors duration-300">Imposta Prezzo</button>
                                <button onClick={handleStartAuction} className="bg-sky-500 text-white p-3 rounded-xl w-full hover:bg-sky-700 transition-colors duration-300">Inizia Asta</button>
                            </>
                        )}
                    </div>
                </div>
            )}
            {details && (
                <div className="text-center w-full md:w-1/3 truncate p-4 md:p-8 bg-sky-200 rounded-lg mb-12">
                    <div className="text-lg font-bold mb-2">Miglior Offerta:</div>
                    <div className="text-xl truncate mb-2">{ethers.utils.formatEther(details.highestBid)} ETH</div>
                    <div className={details.highestBidder === window.ethereum.selectedAddress ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>
                        {details.highestBidder === window.ethereum.selectedAddress ? 'Tu' : details.highestBidder}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTDetails;
