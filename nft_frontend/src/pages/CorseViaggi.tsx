import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';

interface NFT {
  tokenId: number;
  owner: string;
  price: ethers.BigNumber;
  rarity: string;
  discount: string;
  discountOn: string;
}

const CorseViaggi: React.FC = () => {
  const { provider } = useContext(ProviderContext);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [rideType, setRideType] = useState<string>('Monopattino');
  const [minutes, setMinutes] = useState<number>(1); // Imposta il valore di default a 1
  const [finalPrice, setFinalPrice] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [discountedPrice, setDiscountedPrice] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [maxDiscountValue, setMaxDiscountValue] = useState<number>(0);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);

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
      setNfts(items);
    };

    fetchOwnedNFTs();
  }, [provider]);

  const calculatePrices = () => {
    const fixedPrice = ridePrices[rideType];
    let totalPrice = fixedPrice.mul(minutes);
    let totalDiscountedPrice = totalPrice;

    if (isNaN(minutes) || minutes <= 0) {
      setFinalPrice(ethers.BigNumber.from(0));
      setDiscountedPrice(ethers.BigNumber.from(0));
      setMaxDiscountValue(0);
      return;
    }

    let maxDiscount = 0;

    nfts.forEach(nft => {
      if (nft.discountOn.includes("Viaggi")) {
        const discountValue = parseFloat(nft.discount.replace('Discount: ', '').replace('%', ''));
        if (!isNaN(discountValue) && discountValue > maxDiscount) {
          maxDiscount = discountValue;
        }
      }
    });

    if (maxDiscount > 0) {
      const discountAmount = totalPrice.mul(maxDiscount).div(100);
      totalDiscountedPrice = totalDiscountedPrice.sub(discountAmount);
    }

    setFinalPrice(totalPrice);
    setDiscountedPrice(totalDiscountedPrice);
    setMaxDiscountValue(maxDiscount);
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

  const handleStartRide = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLatitude(latitude);
        setUserLongitude(longitude);

        const isWithinMilano = latitude >= 45.40 && latitude <= 45.50 && longitude >= 9.10 && longitude <= 9.30;

        if (isWithinMilano) {
          setLocationStatus('Sei nella zona di Milano, puoi iniziare la corsa!');
        } else {
          setLocationStatus('Ti trovi fuori dalla zona di Milano!');
        }

        setIsPopupVisible(true); // Mostra il pop-up
      }, () => {
        setLocationStatus('Impossibile ottenere la geolocalizzazione.');
        setIsPopupVisible(true);
      });
    } else {
      setLocationStatus('Geolocalizzazione non supportata dal browser.');
      setIsPopupVisible(true);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="mb-12 bg-gradient-to-r from-purple-500 to-sky-500 text-transparent bg-clip-text">CORSE</h1>
      <div className="text-center bg-white rounded-lg shadow p-4 mt-4">
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
            value={minutes} // Non lasciare vuoto, mostra sempre 1 minuto
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setMinutes(newValue >= 1 ? newValue : 1); // Imposta a 1 se l'input è minore di 1
            }} 
            className="border rounded p-2 w-full mt-2"
          />
        </label>

        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mt-2">
            <span className="text-xl font-bold">Totale: </span>
            <span className="text-lg font-bold text-green-500">
              {ethers.utils.formatEther(discountedPrice)} ETH
            </span>
          </div>
        </div>

        <button 
          onClick={handleStartRide} 
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          Avvia Corsa
        </button>
      </div>

      {/* Popup geolocalizzazione */} 
      {isPopupVisible && (
        <div className="fixed top-12 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl mb-4 font-bold">Trova la tua {rideType}</h2>
            <p>{locationStatus}</p>
            {userLatitude && userLongitude && (
              <iframe 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLongitude - 0.01},${userLatitude - 0.01},${userLongitude + 0.01},${userLatitude + 0.01}&layer=mapnik&marker=${userLatitude},${userLongitude}`}
                width="600" 
                height="400" 
                className="mt-4" 
                style={{ border: 'none' }}
                title="Mappa della posizione"
              ></iframe>
            )}
            <button onClick={closePopup} className="mt-4 ml-4 bg-red-500 text-white p-2 rounded">
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorseViaggi;
