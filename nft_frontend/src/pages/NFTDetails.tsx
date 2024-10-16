import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext'; // Importa il contesto del provider

interface NFTDetailsProps {
    tokenId: number;
    owner: string;
    formattedOwner: string;
    price: ethers.BigNumber;
    auctionDuration: number;
    highestBid: ethers.BigNumber;
    highestBidder: string;
    formattedHighestBidder: string; // Supponendo che formattedHighestBidder sia di tipo string
}

const NFTDetails: React.FC = () => {
    const { tokenId } = useParams<{ tokenId: string }>();
    const [details, setDetails] = useState<NFTDetailsProps | null>(null);
    const [newPrice, setNewPrice] = useState('');
    const [auctionDuration, setAuctionDuration] = useState('');
    const [userAccount, setUserAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Stato per gestire il messaggio di attesa
    const { provider } = useContext(ProviderContext); // Ottieni il provider dal contesto

    const formatDuration = (durationInSeconds: number) => {
        const days = Math.floor(durationInSeconds / (24 * 3600));
        const hours = Math.floor((durationInSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;

        return `${days} giorni, ${hours} ore, ${minutes} minuti, ${seconds} secondi`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (provider && tokenId) { // Assicurati che il provider sia stato impostato e tokenId sia valido
                    const signer = provider.getSigner(); // Usa il provider ottenuto dal contesto
                    const contract = getContract(signer);

                    const owner = await contract.ownerOf(parseInt(tokenId));
                    const price = await contract.getPrice(parseInt(tokenId));
                    const highestBid = await contract.highestBid(parseInt(tokenId));
                    const highestBidder = await contract.highestBidder(parseInt(tokenId));
                    const auctionEnd = await contract.auctionEnds(parseInt(tokenId));
                    const isAuctionActive = auctionEnd > Date.now() / 1000;
                    const formattedHighestBidder = highestBidder.toLowerCase();
                    const formattedOwner = owner.toLowerCase();

                    let auctionDuration = 0;
                    if (isAuctionActive) {
                        auctionDuration = await contract.getAuctionDuration(parseInt(tokenId));
                    }

                    setDetails({
                        tokenId: parseInt(tokenId),
                        owner,
                        formattedOwner,
                        price,
                        auctionDuration,
                        highestBid,
                        highestBidder,
                        formattedHighestBidder,
                    });

                    // Richiedi l'account utente
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    setUserAccount(accounts[0]);
                }
            } catch (error) {
                console.error('Errore durante il fetch dei dati:', error);
            }
        };

        fetchData();
    }, [provider, tokenId]);

    const handleStartAuction = async () => {
        try {
            if (details && auctionDuration) {
                setLoading(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                // Resetta highestBidder e highestBid nel frontend
                details.highestBidder = ethers.constants.AddressZero;
                details.highestBid = ethers.BigNumber.from(0);

                const tx = await contract.startAuction(details.tokenId, parseInt(auctionDuration));
                await tx.wait();
                setLoading(false);
                alert('Asta iniziata con successo e migliori offerte resettate!');
            }
        } catch (error) {
            setLoading(false);
            console.error('Errore durante l\'inizio dell\'asta:', error);
            alert('Errore durante l\'inizio dell\'asta');
        }
    };

    const handleSetPrice = async () => {
        try {
            if (details && newPrice) {
                setLoading(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                // Resetta highestBidder e highestBid nel frontend
                details.highestBidder = ethers.constants.AddressZero;
                details.highestBid = ethers.BigNumber.from(0);

                const tx = await contract.sale(details.tokenId, ethers.utils.parseEther(newPrice));
                await tx.wait();
                setLoading(false);
                alert('Prezzo impostato con successo e migliori offerte resettate!');
            }
        } catch (error) {
            setLoading(false);
            console.error('Errore durante l\'impostazione del prezzo:', error);
            alert('Errore durante l\'impostazione del prezzo');
        }
    };

    const handleBid = async () => {
        try {
            if (details && newPrice) {
                setLoading(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const tx = await contract.bid(details.tokenId, { value: ethers.utils.parseEther(newPrice) });
                await tx.wait();
                setLoading(false);
                alert('Offerta effettuata con successo!');
            }
        } catch (error) {
            setLoading(false);
            console.error('Errore durante l\'offerta:', error);
            alert('Errore durante l\'offerta');
        }
    };

    const handleWithdrawRefund = async () => {
        try {
            if (details && userAccount) {
                setLoading(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const tx = await contract.withdrawRefund(details.tokenId);
                await tx.wait();
                setLoading(false);
                alert('Rimborso ritirato con successo!');
            }
        } catch (error) {
            setLoading(false);
            console.error('Errore durante il ritiro del rimborso:', error);
            alert('Errore durante il ritiro del rimborso');
        }
    };

    const handleRedeemNFT = async () => {
        try {
            if (details && userAccount) {
                setLoading(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const tx = await contract.redeemNFT(details.tokenId);
                await tx.wait();
                setLoading(false);
                alert('NFT riscattato con successo!');
            }
        } catch (error) {
            setLoading(false);
            console.error('Errore durante il riscatto dell\'NFT:', error);
            alert('Errore durante il riscatto dell\'NFT');
        }
    };

    return (
        <div className="relative flex justify-center items-center mt-4 flex-col">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-purple-200 bg-opacity-55 backdrop-blur z-50">
                    <div className="bg-white p-6 rounded-lg border border-black shadow-[0px_0px_15px_5px_#0f0f0f] flex flex-col items-center">
                        <p className="text-xl text-purple-500 font-bold mb-4">Attendi la conferma del tx...</p>
                        <img src="https://i.gifer.com/yy3.gif" alt="Loading..." className="h-20 w-20" />
                    </div>
                </div>
            )}
            <h1 className="mb-6 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block text-2xl">DETTAGLIO NFT</h1>
            {details && (
                <div className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform p-4 mb-8 flex flex-wrap">
                    <div className="w-full md:w-1/2 mb-4 md:mb-0">
                        <img
                            src={`https://plus.unsplash.com/premium_photo-1715255817707-fa60ecc054d3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
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
                        {details.auctionDuration > 0 && details.formattedOwner !== userAccount && (
                            <div className="flex items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Offri un prezzo in ETH"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    className="border p-3 rounded-xl w-full"
                                />
                                <button onClick={handleBid} className="bg-purple-500 text-white p-3 w-full rounded-xl hover:bg-purple-700 ml-4 transition-colors duration-300">Bid</button>
                            </div>
                        )}
                        {details.auctionDuration === 0 && details.formattedOwner === userAccount && (
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
            {details && details.formattedHighestBidder !== userAccount && details.auctionDuration > 0 && (
                <div className="text-center w-full md:w-1/3 truncate p-4 md:p-8 bg-sky-200 rounded-lg mb-12">
                    <div className="text-lg font-bold mb-2">Miglior Offerta:</div>
                    <div className="text-xl truncate mb-2">{ethers.utils.formatEther(details.highestBid)} ETH</div>
                    <div className="text-red-500 font-bold">{details.highestBidder}</div>
                    <button onClick={handleWithdrawRefund} className="bg-red-500 text-white p-3 rounded-xl w-full hover:bg-red-700 transition-colors duration-300 mt-4">RIMBORSA VECCHIA OFFERTA</button>
                </div>
            )}
            {details && details.formattedHighestBidder === userAccount && (
                <div className="text-center w-full md:w-1/3 truncate p-4 md:p-8 bg-sky-200 rounded-lg mb-12">
                    <div className="text-lg font-bold mb-2">Miglior Offerta:</div>
                    <div className="text-xl truncate mb-2">{ethers.utils.formatEther(details.highestBid)} ETH</div>
                    <div className="text-green-500 font-bold">{details.highestBidder}</div>
                    {details.auctionDuration === 0 && (
                        <button onClick={handleRedeemNFT} className="bg-green-500 text-white p-3 rounded-xl w-full hover:bg-green-700 transition-colors duration-300 mt-4">RISCUOTI NFT</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NFTDetails;
