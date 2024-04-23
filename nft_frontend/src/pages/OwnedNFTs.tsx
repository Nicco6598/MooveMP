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
            <h1 className="text-2xl font-bold mb-10">I Miei NFT</h1>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-6">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer p-4">
                        <img src={`https://images.unsplash.com/photo-1707344088547-3cf7cea5ca49?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} alt={`NFT ${nft.tokenId}`} className=" h-auto mb-4 rounded-lg mx-auto" />
                        <p className="text-sm mb-1">
                            <span className="font-bold">Token ID:</span> {nft.tokenId}
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold">Proprietario: </span> 
                                {`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold ">Prezzo:</span> {ethers.utils.formatEther(nft.price)} ETH
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold">{nft.rarity}</span> 
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold">{nft.discount}</span> 
                        </p>
                        <p className="text-sm mb-4">
                            <span className="font-bold">{nft.discountOn}</span> 
                        </p>
                        <Link to={`/nft/${nft.tokenId}`} className="bg-sky-500 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out">
                                Visualizza Dettagli
                            </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OwnedNFTs;
