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
    isForSale: boolean;
}

const Marketplace: React.FC = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    useEffect(() => {
        const fetchNFTs = async () => {
            const contract = getContract(provider);
            const items: NFT[] = [];
            const totalSupply = await contract.nextTokenId();
            for (let i = 0; i < totalSupply.toNumber(); i++) {
                const owner = await contract.ownerOf(i);
                const tokenPrice = await contract.tokenPrices(i);
                const tokenAttributes = await contract.getTokenAttributes(i);
                const isForSale = await contract.isForSale(i);
                const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => attr.trim());
                items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn, isForSale });
            }
            setNfts(items);
        };

        fetchNFTs();
    }, []);

    const purchaseNFT = async (tokenId: number, price: ethers.BigNumber) => {
        try {
            const signer = provider.getSigner();
            const contract = getContract(provider);
            await contract.connect(signer).purchaseNFT(tokenId, { value: price });
            // Aggiornamento dell'elenco degli NFT dopo l'acquisto
            const updatedNFTs = nfts.filter(nft => nft.tokenId !== tokenId);
            setNfts(updatedNFTs);
        } catch (error) {
            console.error('Errore durante l\'acquisto:', error);
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-10 mt-12 text-center">MARKETPLACE NFT</h1>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] hover:shadow-[0px_0px_15px_10px_#EBF4FF] transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer p-4 mr-8 mt-4">
                        <img src={`https://images.unsplash.com/photo-1707344088547-3cf7cea5ca49?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} alt={`NFT ${nft.tokenId}`} className="h-auto mb-4 rounded-lg mx-auto" />
                        <p className="text-sm mb-1">
                            <span className="font-bold">Token ID:</span> {nft.tokenId}
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold">Proprietario: </span> 
                            {`${nft.owner.slice(0, 7)}...${nft.owner.slice(-5)}`}
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold ">Prezzo:</span> {ethers.utils.formatEther(nft.price)} ETH
                        </p>
                        <p className="text-sm mb-1 text-green">
                            <span className="font-bold">{nft.rarity}</span> 
                        </p>
                        <p className="text-sm mb-1">
                            <span className="font-bold">{nft.discount}</span> 
                        </p>
                        <p className="text-sm mb-8">
                            <span className="font-bold">{nft.discountOn}</span> 
                        </p>
                        {nft.isForSale && (
                            <div className="flex justify-center space-x-4">
                                <button onClick={() => purchaseNFT(nft.tokenId, nft.price)} className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 ease-in-out">
                                    Compra Ora
                                </button>
                                <Link to={`/nft/${nft.tokenId}`} className="bg-sky-500 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out">
                                    Visualizza Dettagli
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
