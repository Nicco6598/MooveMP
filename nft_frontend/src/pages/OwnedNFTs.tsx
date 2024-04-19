import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';

interface NFT {
    tokenId: number;
    owner: string;
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
                    items.push({ tokenId: i, owner });
                }
            }
            setNfts(items);
        };

        fetchOwnedNFTs();
    }, []);

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-5">I Miei NFT</h1>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="text-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,_10,_184,_0.2)] transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer p-4">
                        <img src={`https://ipfs.io/ipfs/IMAGE_HASH`} alt={`NFT ${nft.tokenId}`} className="w-full h-auto mb-2 rounded-lg" />
                        <p className="text-sm">
                            <span className="font-bold">Token ID: {nft.tokenId}</span> 
                        </p>
                        <p className="text-sm">
                            <span className="italic">Owner:</span> {nft.owner}
                        </p>
                        <Link to={`/nft/${nft.tokenId}`} className="text-blue-500 hover:underline text-sm">Visualizza Dettagli</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OwnedNFTs;
