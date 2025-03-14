import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';
import { Modal } from '../components/Modal';

interface NFT {
  tokenId: number;
  owner: string;
  price: ethers.BigNumber;
  rarity: string;
  discount: string;
  discountOn: string;
}

const vehicleTypes = [
  { id: 'Monopattino', name: 'Monopattino Elettrico', basePrice: '0.0005', icon: '🛴', image: '/images/monopattino.png' },
  { id: 'Auto Green', name: 'Auto Elettrica', basePrice: '0.0025', icon: '🚗', image: '/images/auto-green.png' },
  { id: 'E-bike', name: 'E-Bike', basePrice: '0.0003', icon: '🚲', image: '/images/ebike.png' },
];

const CorseViaggi: React.FC = () => {
  const { provider } = useContext(ProviderContext);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [rideType, setRideType] = useState<string>('Monopattino');
  const [minutes, setMinutes] = useState<number>(15);
  const [finalPrice, setFinalPrice] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [discountedPrice, setDiscountedPrice] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [maxDiscountValue, setMaxDiscountValue] = useState<number>(0);
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [rideStarted, setRideStarted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ridePrices: { [key: string]: ethers.BigNumber } = {
    Monopattino: ethers.utils.parseEther('0.0005'),
    'Auto Green': ethers.utils.parseEther('0.0025'),
    'E-bike': ethers.utils.parseEther('0.0003'),
  };

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!provider) return;
      
      try {
        setIsLoading(true);
        const contract = getContract(provider);
        const totalSupply = await contract.nextTokenId();
        const items: NFT[] = [];
        const signerAddress = await provider.getSigner().getAddress();
        
        for (let i = 0; i < totalSupply.toNumber(); i++) {
          const owner = await contract.ownerOf(i);
          if (owner === signerAddress) {
            const tokenPrice = await contract.tokenPrices(i);
            const tokenAttributes = await contract.getTokenAttributes(i);
            
            // Parse attributes
            const [rarity, discount, discountOn] = tokenAttributes.split(',').map((attr: string) => {
              const cleanedAttr = attr.replace(/.*?:/, '').trim();
              return cleanedAttr;
            });
            
            items.push({ tokenId: i, owner, price: tokenPrice, rarity, discount, discountOn });
          }
        }
        
        setNfts(items);
      } catch (error) {
        console.error("Error fetching owned NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedNFTs();
  }, [provider]);

  useEffect(() => {
    calculatePrices();
  }, [minutes, rideType, nfts]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (rideStarted) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setMinutes(Math.ceil(elapsedTime / 60) + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [rideStarted, elapsedTime]);

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
        // Extract the percentage from something like "15%" or "Discount: 15%"
        const discountMatch = nft.discount.match(/(\d+)%/);
        const discountValue = discountMatch ? parseInt(discountMatch[1], 10) : 0;
        
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

  const handleStartRide = async () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLatitude(latitude);
          setUserLongitude(longitude);

          const isWithinMilano = latitude >= 45.40 && latitude <= 45.50 && longitude >= 9.10 && longitude <= 9.30;

          if (isWithinMilano) {
            setLocationStatus('Sei nella zona di Milano, puoi iniziare la corsa!');
          } else {
            setLocationStatus('Ti trovi fuori dalla zona di Milano!');
          }

          setIsPopupVisible(true);
          setIsLoading(false);
        }, 
        () => {
          setLocationStatus('Impossibile ottenere la geolocalizzazione.');
          setIsPopupVisible(true);
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationStatus('Geolocalizzazione non supportata dal browser.');
      setIsPopupVisible(true);
    }
  };

  const startRideHandler = () => {
    setRideStarted(true);
    setIsPopupVisible(false);
  };

  const stopRideHandler = () => {
    setRideStarted(false);
    setElapsedTime(0);
    // Qui potresti implementare la logica per il pagamento finale
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedVehicle = vehicleTypes.find(v => v.id === rideType) || vehicleTypes[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
          Mobilità Urbana
        </h1>
        <p className="text-neutral-600 max-w-2xl text-center mb-6">
          Prenota un veicolo e approfitta degli sconti NFT per risparmiare sui tuoi spostamenti.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-neutral-200 shadow-lg">
          {rideStarted ? (
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 flex items-center justify-center bg-primary-100 rounded-full mb-4">
                  <span className="text-4xl">{selectedVehicle.icon}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Corsa in corso</h2>
                <p className="text-neutral-600">Stai utilizzando un {selectedVehicle.name}</p>
              </div>
              
              <div className="bg-primary-50 rounded-xl p-6 mb-6 flex flex-col items-center">
                <p className="text-primary-700 mb-2">Tempo trascorso</p>
                <p className="text-4xl font-mono font-bold text-primary-800 mb-4">{formatTime(elapsedTime)}</p>
                <p className="text-sm text-neutral-600">Costo attuale: {ethers.utils.formatEther(discountedPrice)} ETH</p>
              </div>
              
              <button
                onClick={stopRideHandler}
                className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm"
              >
                Termina corsa
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2">
              <div className="p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-6">Seleziona il tuo veicolo</h2>
                
                <div className="space-y-3 mb-6">
                  {vehicleTypes.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => setRideType(vehicle.id)}
                      className={`w-full flex items-center p-3 rounded-xl border-2 transition-all ${
                        rideType === vehicle.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-2xl mr-3">{vehicle.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-neutral-500">{vehicle.basePrice} ETH / minuto</p>
                      </div>
                      {rideType === vehicle.id && (
                        <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tempo stimato (minuti)
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setMinutes(prev => (prev > 1 ? prev - 5 : 1))}
                      className="p-2 bg-neutral-100 rounded-l-lg text-neutral-700 hover:bg-neutral-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        setMinutes(newValue >= 1 ? newValue : 1);
                      }}
                      className="flex-1 border-y border-neutral-300 p-2 text-center"
                      min="1"
                    />
                    <button
                      onClick={() => setMinutes(prev => prev + 5)}
                      className="p-2 bg-neutral-100 rounded-r-lg text-neutral-700 hover:bg-neutral-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {maxDiscountValue > 0 && (
                  <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-green-700">
                        Sconto NFT applicato: {maxDiscountValue}%
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto">
                  <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-neutral-600">Prezzo base:</p>
                      <p className="text-sm font-medium">{ethers.utils.formatEther(finalPrice)} ETH</p>
                    </div>
                    
                    {maxDiscountValue > 0 && (
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-neutral-600">Sconto ({maxDiscountValue}%):</p>
                        <p className="text-sm font-medium text-green-600">
                          -{ethers.utils.formatEther(finalPrice.sub(discountedPrice))} ETH
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold pt-2 border-t border-neutral-200">
                      <p>Totale:</p>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                        {ethers.utils.formatEther(discountedPrice)} ETH
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleStartRide} 
                    disabled={isLoading}
                    className="w-full py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-sm flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Localizzazione...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        Avvia Corsa
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="bg-neutral-100 p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-full shadow-md flex items-center justify-center">
                    <span className="text-8xl">{selectedVehicle.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{selectedVehicle.name}</h3>
                  <p className="text-neutral-600 mb-4">
                    Velocità massima: {rideType === 'Auto Green' ? '80 km/h' : rideType === 'Monopattino' ? '25 km/h' : '35 km/h'}
                  </p>
                  <div className="flex justify-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Eco-Friendly</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Elettrico</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Smart</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {nfts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">I tuoi NFT con sconti mobilità</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.filter(nft => nft.discountOn.includes("Viaggi")).map(nft => (
                <div key={nft.tokenId} className="bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200 p-4 flex items-center">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-xl">{nft.tokenId}</span>
                  </div>
                  <div>
                    <p className="font-medium">{nft.rarity} NFT</p>
                    <p className="text-sm text-primary-600">{nft.discount} su {nft.discountOn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal per geolocalizzazione */}
      <Modal
        isOpen={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        title="Trova il tuo veicolo"
        size="lg"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">{selectedVehicle.icon}</span>
          </div>
          
          <h3 className="text-xl font-medium mb-2">{selectedVehicle.name}</h3>
          <p className={`text-lg ${locationStatus.includes('zona di Milano') ? 'text-green-600' : 'text-red-600'} mb-4`}>
            {locationStatus}
          </p>
          
          {userLatitude && userLongitude && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200 h-64">
              <iframe 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLongitude - 0.01},${userLatitude - 0.01},${userLongitude + 0.01},${userLatitude + 0.01}&layer=mapnik&marker=${userLatitude},${userLongitude}`}
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                title="Mappa della posizione"
              ></iframe>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setIsPopupVisible(false)} 
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Annulla
            </button>
            
            {locationStatus.includes('zona di Milano') && (
              <button 
                onClick={startRideHandler} 
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Inizia Corsa
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CorseViaggi;