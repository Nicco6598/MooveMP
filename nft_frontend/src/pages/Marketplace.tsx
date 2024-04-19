import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface NFT {
    tokenId: number;
    price: ethers.BigNumber;
}

const Marketplace: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    useEffect(() => {
        const fetchNFTs = async () => {
            const contract = getContract(provider);
            const items = [];
            const totalSupply = await contract.nextTokenId();
            for (let i = 0; i < totalSupply.toNumber(); i++) {
                const price = await contract.tokenPrices(i);
                if (!price.isZero()) {
                    items.push({ tokenId: i, price });
                }
            }
            setNfts(items);
        };

        fetchNFTs();
    }, []);

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-5">NFTs in Vendita</h1>
            <div className="grid grid-cols-3 gap-12">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,_112,_184,_0.3)] transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer p-4">
                        <p className="text-black-600">Token ID: {nft.tokenId}</p>
                        <p className="text-black-600">Prezzo: {ethers.utils.formatEther(nft.price.toString())} ETH</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
