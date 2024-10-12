import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFT {
  tokenId: number;
  owner: string;
  price: ethers.BigNumber;
  rarity: string;
  discount: string; // Mantieni come stringa per gestire la percentuale
  discountOn: string;
}

const CorseViaggi: React.FC = () => {
  const { provider } = useContext(ProviderContext);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [rideType, setRideType] = useState<string>('Monopattino');
  const [minutes, setMinutes] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [discountedPrice, setDiscountedPrice] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [maxDiscountValue, setMaxDiscountValue] = useState<number>(0); // Stato per maxDiscountValue
  const [imageSrc, setImageSrc] = useState<string>('');

  const ridePrices: { [key: string]: ethers.BigNumber } = {
    Monopattino: ethers.utils.parseEther('0.0005'),
    'Auto Green': ethers.utils.parseEther('0.0025'),
    'E-bike': ethers.utils.parseEther('0.0003'),
  };

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!provider) return;
      const contract = getContract(provider);
      const totalSupply = await contract.nextTokenId();
      const items: NFT[] = [];
      for (let i = 0; i < totalSupply.toNumber(); i++) {
        const owner = await contract.ownerOf(i);
        const signerAddress = await provider.getSigner().getAddress();
        if (owner === signerAddress) {
          const tokenPrice = await contract.tokenPrices(i);
          const tokenAttributes = await contract.getTokenAttributes(i);
          const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => attr.trim());
          items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn });
        }
      }
      console.log('NFTs Owned:', items); // Log degli NFT recuperati
      setNfts(items);
    };

    fetchOwnedNFTs();
  }, [provider]);

  const calculatePrices = () => {
    const fixedPrice = ridePrices[rideType];
    let totalPrice = fixedPrice.mul(minutes);
    let totalDiscountedPrice = totalPrice;

    // Controllo della validità di minutes
    if (isNaN(minutes) || minutes <= 0) {
      console.warn('Invalid minutes value:', minutes);
      setFinalPrice(ethers.BigNumber.from(0));
      setDiscountedPrice(ethers.BigNumber.from(0));
      setMaxDiscountValue(0); // Reset max discount
      return;
    }

    let maxDiscount = 0;

    nfts.forEach(nft => {
      console.log(`Processing NFT ID: ${nft.tokenId}, discount: ${nft.discount}, discountOn: ${nft.discountOn}`);
      if (nft.discountOn.includes("Viaggi")) {
        console.log(`Raw discount: ${nft.discount}`);

        // Rimuovi il prefisso "Discount: " e il simbolo %
        const discountStr = nft.discount.replace('Discount: ', '').replace('%', '').trim();

        // Log per vedere il valore di discountStr prima del parsing
        console.log(`Discount String for parsing: '${discountStr}'`);

        // Converti in numero
        const discountValue = parseFloat(discountStr);

        // Log del valore di sconto dopo il parsing
        console.log(`Discount Value (parsed): ${discountValue}`);

        // Verifica se discountValue è un numero valido
        if (!isNaN(discountValue) && discountValue > maxDiscount) {
          maxDiscount = discountValue; // Aggiorna il massimo sconto
        }
      }
    });

    // Calcola l'importo dello sconto massimo
    if (maxDiscount > 0) {
      const discountAmount = totalPrice.mul(maxDiscount).div(100);
      totalDiscountedPrice = totalDiscountedPrice.sub(discountAmount);
    }

    setFinalPrice(totalPrice);
    setDiscountedPrice(totalDiscountedPrice);
    setMaxDiscountValue(maxDiscount); // Aggiorna maxDiscountValue nello stato
  };

  useEffect(() => {
    calculatePrices();
  }, [minutes, rideType, nfts]);

  const handleRideTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRideType(e.target.value);

    switch (e.target.value) {
      case 'Monopattino':
        setImageSrc('/images/monopattino.png');
        break;
      case 'Auto Green':
        setImageSrc('/images/auto-green.png');
        break;
      case 'E-bike':
        setImageSrc('/images/ebike.png');
        break;
      default:
        setImageSrc('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="mb-12 flex flex-col items-center pt-8 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text inline-block">CORSE</h1>
      <div className="text-center bg-white rounded-lg shadow-[0px_0px_15px_5px_#edf2f7] p-4 mt-4">
        {imageSrc && <img src={imageSrc} alt={rideType} className="w-64 h-auto mb-4" />}
        <label className="block mb-4 text-lg">
          Tipo di Corsa:
          <select 
            value={rideType} 
            onChange={handleRideTypeChange}
            className="border rounded p-2 w-full mt-2"
          >
            <option value="Monopattino">Monopattino</option>
            <option value="Auto Green">Auto Green</option>
            <option value="E-bike">E-bike</option>
          </select>
        </label>
        <label className="block mb-4 text-lg">
          Minuti:
          <input
            type="number"
            value={minutes > 0 ? minutes : ''} // Imposta a '' se minutes è <= 0
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setMinutes(newValue >= 0 ? newValue : 0); // Assicurati che minutes non sia mai negativo
            }} 
            className="border rounded p-2 w-full mt-2"
          />
        </label>

        {/* Tabella dei prezzi */}
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg"></span>
            <span className="text-lg font-bold text-red-500">{ethers.utils.formatEther(finalPrice)} ETH</span>
          </div>
          <div className="flex justify-between items-center my-2">
            <span className="text-xl font-bold">-</span>
            <span className="text-lg text-amber-500 font-bold">
            {ethers.utils.formatEther(finalPrice.sub(discountedPrice))} ({maxDiscountValue}%)
            </span>
          </div>
          <hr className="border-gray-400" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xl font-bold">Totale: </span>
            <span className="text-lg font-bold text-green-500">{ethers.utils.formatEther(discountedPrice)} ETH</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CorseViaggi;
