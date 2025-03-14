import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFTDetailsProps {
    tokenId: number;
    owner: string;
    formattedOwner: string;
    price: ethers.BigNumber;
    auctionDuration: number;
    highestBid: ethers.BigNumber;
    highestBidder: string;
    formattedHighestBidder: string;
    attributes: {
        rarity: string;
        discount: string;
        discountOn: string;
    };
}

const NFTDetails: React.FC = () => {
    const { tokenId } = useParams<{ tokenId: string }>();
    const [details, setDetails] = useState<NFTDetailsProps | null>(null);
    const [newPrice, setNewPrice] = useState('');
    const [auctionDuration, setAuctionDuration] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [userAccount, setUserAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [transactionPending, setTransactionPending] = useState(false);
    const { provider } = useContext(ProviderContext);

    const formatDuration = (durationInSeconds: number) => {
        const days = Math.floor(durationInSeconds / (24 * 3600));
        const hours = Math.floor((durationInSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;

        return `${days}g ${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (provider && tokenId) {
                    setLoading(true);
                    const signer = provider.getSigner();
                    const contract = getContract(signer);

                    const owner = await contract.ownerOf(parseInt(tokenId));
                    const price = await contract.getPrice(parseInt(tokenId));
                    const highestBid = await contract.highestBid(parseInt(tokenId));
                    const highestBidder = await contract.highestBidder(parseInt(tokenId));
                    const auctionEnd = await contract.auctionEnds(parseInt(tokenId));
                    const tokenAttributes = await contract.getTokenAttributes(parseInt(tokenId));
                    const isAuctionActive = auctionEnd > Date.now() / 1000;
                    const formattedHighestBidder = highestBidder.toLowerCase();
                    const formattedOwner = owner.toLowerCase();

                    // Parse attributes
                    const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => {
                        const cleanedAttr = attr.replace(/.*?:/, '').trim();
                        return cleanedAttr;
                    });

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
                        attributes: {
                            rarity,
                            discount,
                            discountOn
                        }
                    });

                    // Richiedi l'account utente
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    setUserAccount(accounts[0]);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Errore durante il fetch dei dati:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [provider, tokenId]);

    const handleStartAuction = async () => {
        try {
            if (details && auctionDuration) {
                setTransactionPending(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                // Resetta highestBidder e highestBid nel frontend
                details.highestBidder = ethers.constants.AddressZero;
                details.highestBid = ethers.BigNumber.from(0);

                const tx = await contract.startAuction(details.tokenId, parseInt(auctionDuration));
                await tx.wait();
                setTransactionPending(false);
                alert('Asta iniziata con successo e migliori offerte resettate!');
            }
        } catch (error) {
            setTransactionPending(false);
            console.error('Errore durante l\'inizio dell\'asta:', error);
            alert('Errore durante l\'inizio dell\'asta');
        }
    };

    const handleSetPrice = async () => {
        try {
            if (details && newPrice) {
                setTransactionPending(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                // Resetta highestBidder e highestBid nel frontend
                details.highestBidder = ethers.constants.AddressZero;
                details.highestBid = ethers.BigNumber.from(0);

                const tx = await contract.sale(details.tokenId, ethers.utils.parseEther(newPrice));
                await tx.wait();
                setTransactionPending(false);
                alert('Prezzo impostato con successo e migliori offerte resettate!');
            }
        } catch (error) {
            setTransactionPending(false);
            console.error('Errore durante l\'impostazione del prezzo:', error);
            alert('Errore durante l\'impostazione del prezzo');
        }
    };

    const handleBid = async () => {
        try {
            if (details && bidAmount) {
                setTransactionPending(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const tx = await contract.bid(details.tokenId, { value: ethers.utils.parseEther(bidAmount) });
                await tx.wait();
                setTransactionPending(false);
                alert('Offerta effettuata con successo!');
            }
        } catch (error) {
            setTransactionPending(false);
            console.error('Errore durante l\'offerta:', error);
            alert('Errore durante l\'offerta');
        }
    };

    const handleWithdrawRefund = async () => {
        try {
            if (details && userAccount) {
                setTransactionPending(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const tx = await contract.withdrawRefund(details.tokenId);
                await tx.wait();
                setTransactionPending(false);
                alert('Rimborso ritirato con successo!');
            }
        } catch (error) {
            setTransactionPending(false);
            console.error('Errore durante il ritiro del rimborso:', error);
            alert('Errore durante il ritiro del rimborso');
        }
    };

    const handleRedeemNFT = async () => {
        try {
            if (details && userAccount) {
                setTransactionPending(true);
                const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
                const contract = getContract(signer);

                const tx = await contract.redeemNFT(details.tokenId);
                await tx.wait();
                setTransactionPending(false);
                alert('NFT riscattato con successo!');
            }
        } catch (error) {
            setTransactionPending(false);
            console.error('Errore durante il riscatto dell\'NFT:', error);
            alert('Errore durante il riscatto dell\'NFT');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {transactionPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                        <p className="text-lg font-medium text-neutral-800">Transazione in corso...</p>
                        <p className="text-sm text-neutral-500 mt-2">Attendi la conferma della blockchain</p>
                    </div>
                </div>
            )}
    
            {details && (
                <div className="max-w-6xl mx-auto">
                    <Link to="/marketplace" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Torna al marketplace
                    </Link>
    
                    <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden border border-neutral-200">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Colonna immagine */}
                            <div className="p-6 flex flex-col">
                                <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                                    <img
                                        src={`https://picsum.photos/seed/${details.tokenId}/800/800`}
                                        alt={`NFT ${details.tokenId}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium">
                                        #{details.tokenId}
                                    </div>
                                </div>
    
                                <div className="bg-neutral-50 rounded-xl p-4 mt-auto">
                                    <h3 className="text-sm font-medium text-neutral-500 mb-2">Proprietario</h3>
                                    <a 
                                        href={`https://sepolia.etherscan.io/address/${details.owner}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-primary-600 hover:underline"
                                    >
                                        <span className="font-mono">{details.owner.substring(0, 8)}...{details.owner.substring(details.owner.length - 6)}</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
    
                            {/* Colonna dettagli */}
                            <div className="p-6 md:border-l border-neutral-200">
                                <h1 className="text-2xl font-bold mb-4">NFT #{details.tokenId}</h1>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-neutral-50 rounded-xl p-4">
                                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Rarità</h3>
                                        <p className="text-lg font-bold text-primary-700">{details.attributes.rarity}</p>
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl p-4">
                                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Prezzo</h3>
                                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                                            {ethers.utils.formatEther(details.price)} ETH
                                        </p>
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl p-4">
                                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Sconto</h3>
                                        <p className="text-lg font-bold text-secondary-700">{details.attributes.discount}</p>
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl p-4">
                                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Applicato su</h3>
                                        <p className="text-lg font-bold text-secondary-700">{details.attributes.discountOn}</p>
                                    </div>
                                </div>
    
                                {details.auctionDuration > 0 && (
                                    <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
                                        <h3 className="text-sm font-bold text-primary-700 mb-1">Asta attiva</h3>
                                        <p className="text-lg font-bold text-primary-800 mb-4">
                                            Tempo rimanente: {formatDuration(details.auctionDuration)}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm text-neutral-500">Offerta massima</h4>
                                                <p className="text-lg font-bold text-primary-600">
                                                    {ethers.utils.formatEther(details.highestBid)} ETH
                                                </p>
                                            </div>
                                            {details.highestBidder !== ethers.constants.AddressZero && (
                                                <div>
                                                    <h4 className="text-sm text-neutral-500">Miglior offerente</h4>
                                                    <p className="text-sm font-mono truncate max-w-[150px]">
                                                        {details.highestBidder.substring(0, 6)}...{details.highestBidder.substring(details.highestBidder.length - 4)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
    
                                {/* Pannello di controllo per proprietario */}
                                {details.formattedOwner === userAccount && details.auctionDuration === 0 && (
                                    <div className="border border-neutral-200 rounded-xl p-4 mb-6">
                                        <h3 className="text-lg font-medium mb-4">Pannello di controllo</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                    Prezzo (ETH)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPrice}
                                                    onChange={e => setNewPrice(e.target.value)}
                                                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                    placeholder="Inserisci il prezzo in ETH"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                    Durata asta (giorni)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={auctionDuration}
                                                    onChange={e => setAuctionDuration(e.target.value)}
                                                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                    placeholder="Inserisci la durata in giorni"
                                                />
                                            </div>
                                            
                                            <div className="flex gap-4 pt-2">
                                                <button
                                                    onClick={handleSetPrice}
                                                    className="flex-1 py-2 px-4 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors font-medium"
                                                    disabled={!newPrice}
                                                >
                                                    Imposta Prezzo
                                                </button>
                                                <button
                                                    onClick={handleStartAuction}
                                                    className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                                                    disabled={!auctionDuration}
                                                >
                                                    Avvia Asta
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Pannello offerta per non proprietari */}
                                {details.formattedOwner !== userAccount && details.auctionDuration > 0 && (
                                    <div className="border border-neutral-200 rounded-xl p-4 mb-6">
                                        <h3 className="text-lg font-medium mb-4">Fai un'offerta</h3>
                                        
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={bidAmount}
                                                onChange={e => setBidAmount(e.target.value)}
                                                className="flex-1 p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                                placeholder="Importo in ETH"
                                            />
                                            <button
                                                onClick={handleBid}
                                                className="py-2 px-6 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium whitespace-nowrap"
                                                disabled={!bidAmount}
                                            >
                                                Offri
                                            </button>
                                        </div>
                                        
                                        <p className="text-xs text-neutral-500 mt-2">
                                            *L'offerta deve essere superiore all'offerta corrente più alta
                                        </p>
                                    </div>
                                )}
                                
                                {/* Pannello per il miglior offerente */}
                                {details.formattedHighestBidder === userAccount && (
                                    <div className="border border-neutral-200 rounded-xl p-4 mb-6 bg-green-50">
                                        <h3 className="text-lg font-medium text-green-700 mb-2">
                                            Sei il miglior offerente!
                                        </h3>
                                        
                                        {details.auctionDuration === 0 && (
                                            <div>
                                                <p className="text-sm text-neutral-600 mb-4">
                                                    L'asta è terminata e hai vinto! Puoi riscattare il tuo NFT.
                                                </p>
                                                <button
                                                    onClick={handleRedeemNFT}
                                                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    Riscatta NFT
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Pannello per offerente precedente */}
                                {details.highestBidder !== ethers.constants.AddressZero && 
                                 details.formattedHighestBidder !== userAccount && 
                                 details.auctionDuration > 0 && (
                                    <div className="border border-red-200 rounded-xl p-4 mb-6 bg-red-50">
                                        <h3 className="text-lg font-medium text-red-700 mb-2">
                                            La tua offerta è stata superata
                                        </h3>
                                        <p className="text-sm text-neutral-600 mb-4">
                                            Puoi ritirare il tuo deposito precedente e fare una nuova offerta.
                                        </p>
                                        <button
                                            onClick={handleWithdrawRefund}
                                            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            Ritira rimborso
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NFTDetails;