import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import getContract from '../utils/getContract';

interface NFT {
    tokenId: number;
    owner: string;
    price: ethers.BigNumber;
    rarity: string;
    discount: string;
    discountOn: string;
    auctionEnd: number;
}

const AuctionPage: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    useEffect(() => {
        const fetchAuctionNFTs = async () => {
            const contract = getContract(provider);
            const items: NFT[] = [];
            const totalSupply = await contract.nextTokenId();
            for (let i = 0; i < totalSupply.toNumber(); i++) {
                const owner = await contract.ownerOf(i);
                const tokenPrice = await contract.tokenPrices(i);
                const tokenAttributes = await contract.getTokenAttributes(i);
                const auctionEnd = await contract.auctionEnds(i);
                const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => attr.trim());
                if (auctionEnd > Math.floor(Date.now() / 1000)) { // Verifica se l'asta è ancora attiva
                    items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn, auctionEnd });
                }
            }
            setNfts(items);
        };

        fetchAuctionNFTs();
    }, []);

    const calculateTimeRemaining = (auctionEnd: number) => {
        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = auctionEnd - now;
        if (timeRemaining <= 0) {
            return 'Asta scaduta';
        } else {
            const days = Math.floor(timeRemaining / (3600 * 24));
            const hours = Math.floor((timeRemaining % (3600 * 24)) / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            return `${days}d ${hours}h ${minutes}m`;
        }
    };

    return (
        <div className="p-5">
            <h1 className="mb-12 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">ASTE LIVE</h1>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer p-4">
                        <p className="text-sm mt-4 mb-2">
                            <span className="font-bold">Token ID:</span> {nft.tokenId}
                        </p>
                        <p className="text-sm mb-1 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">
                            <span className="font-bold">{nft.rarity}</span>
                        </p>
                        <p></p>
                        <p className="text-sm mb-1 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">
                            <span className="font-bold">{nft.discount}</span>
                        </p>
                        <p></p>
                        <p className="text-sm mb-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">
                            <span className="font-bold">{nft.discountOn}</span>
                        </p>
                        <p className="text-lg font-semibold text-gray-950 mb-2">Tempo rimanente:</p>
                        <p className="text-lg mb-4">
                            <span className="font-bold text-xl bg-gradient-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text inline-block">
                                {calculateTimeRemaining(nft.auctionEnd)}
                            </span>
                        </p>
                        <Link to={`/nft/${nft.tokenId}`}>
                            <button className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 ease-in-out">
                                Fai un'offerta
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuctionPage;
