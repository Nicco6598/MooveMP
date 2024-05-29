import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface NFT {
    tokenId: number;
    owner: string;
    price: ethers.BigNumber;
    rarity: string;
    discount: string;
    discountOn: string;
}

const OwnedNFTs: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    useEffect(() => {
        const fetchOwnedNFTs = async () => {
            const contract = getContract(provider);
            const totalSupply = await contract.nextTokenId();
            const items: NFT[] = [];
            for (let i = 0; i < totalSupply.toNumber(); i++) {
                const owner = await contract.ownerOf(i);
                if (owner === await signer.getAddress()) {
                    const tokenPrice = await contract.tokenPrices(i);
                    const tokenAttributes = await contract.getTokenAttributes(i);
                    const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => attr.trim());
                    items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn });
                }
            }
            setNfts(items);
        };

        fetchOwnedNFTs();
    }, []);

    return (
        <div className="p-5">
            <h1 className="mb-16 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">I MIEI NFT</h1>
            <div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] p-4 mt-4">
                        <img src={`https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} alt={`NFT ${nft.tokenId}`} className="h-auto mb-4 rounded-lg mx-auto" />
                        <p className="text-sm mt-8">
                            <span className="font-bold">Token ID:</span> {nft.tokenId}
                        </p>
                        <p className="text-gray-700 text-sm font-semibold mb-8 truncate">
                            Buyer: <a href={`https://sepolia.etherscan.io/address/${nft.owner}`} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{nft.owner.slice(0, 7)}...{nft.owner.slice(-5)}</a>
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
                        <p className="text-xl mb-1">
                            <span className="font-semibold text-xl bg-gradient-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text inline-block mb-8">Prezzo: {ethers.utils.formatEther(nft.price)} ETH </span>
                        </p>
                        <Link to={`/nft/${nft.tokenId}`} className="bg-sky-500 text-white p-2 rounded-lg hover:bg-sky-700 transition-colors duration-300 ease-in-out">
                            Visualizza Dettagli
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OwnedNFTs;
