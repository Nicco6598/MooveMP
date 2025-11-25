import React, { useEffect, useState, useContext } from 'react';
import { formatEther, parseEther } from 'ethers';
import getContract from '../utils/getContract';
import { ProviderContext } from './ProviderContext';
import { Modal } from '../components/Modal';

interface NFT {
  tokenId: number;
  owner: string;
  price: bigint;
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
  const [finalPrice, setFinalPrice] = useState<bigint>(0n);
  const [discountedPrice, setDiscountedPrice] = useState<bigint>(0n);
  const [maxDiscountValue, setMaxDiscountValue] = useState<number>(0);
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [rideStarted, setRideStarted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ridePrices: { [key: string]: bigint } = {
    Monopattino: parseEther('0.0005'),
    'Auto Green': parseEther('0.0025'),
    'E-bike': parseEther('0.0003'),
  };

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!provider) return;
      
      try {
        setIsLoading(true);
        const contract = getContract(provider);
        const totalSupply = await contract.nextTokenId();
        const items: NFT[] = [];
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        
        for (let i = 0; i < Number(totalSupply); i++) {
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
    let totalPrice = fixedPrice * BigInt(minutes);
    let totalDiscountedPrice = totalPrice;

    if (isNaN(minutes) || minutes <= 0) {
      setFinalPrice(0n);
      setDiscountedPrice(0n);
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
      const discountAmount = (totalPrice * BigInt(maxDiscount)) / 100n;
      totalDiscountedPrice = totalDiscountedPrice - discountAmount;
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
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Mobilità <span className="text-gradient">Urbana</span>
            </h1>
            <p className="text-lg text-neutral-400">
              Prenota un veicolo e approfitta degli sconti NFT per risparmiare sui tuoi spostamenti.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden">
          {rideStarted ? (
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 flex items-center justify-center bg-accent-500/20 rounded-2xl border border-accent-500/30 mb-4">
                  <span className="text-4xl">{selectedVehicle.icon}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Corsa in corso</h2>
                <p className="text-neutral-400">Stai utilizzando un {selectedVehicle.name}</p>
              </div>
              
              <div className="bg-accent-500/10 rounded-xl p-6 mb-6 flex flex-col items-center border border-accent-500/20">
                <p className="text-neutral-400 mb-2">Tempo trascorso</p>
                <p className="text-4xl font-mono font-bold text-white mb-4">{formatTime(elapsedTime)}</p>
                <p className="text-sm text-neutral-400">Costo attuale: <span className="text-gradient font-semibold">{formatEther(discountedPrice)} ETH</span></p>
              </div>
              
              <button
                onClick={stopRideHandler}
                className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Termina corsa
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2">
              <div className="p-6 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-6">Seleziona il tuo veicolo</h2>
                
                <div className="space-y-3 mb-6">
                  {vehicleTypes.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => setRideType(vehicle.id)}
                      className={`w-full flex items-center p-3 rounded-xl border transition-all ${
                        rideType === vehicle.id 
                          ? 'border-accent-500/50 bg-accent-500/10' 
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-2xl mr-3">{vehicle.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-white">{vehicle.name}</p>
                        <p className="text-sm text-neutral-500">{vehicle.basePrice} ETH / minuto</p>
                      </div>
                      {rideType === vehicle.id && (
                        <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Tempo stimato (minuti)
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setMinutes(prev => (prev > 1 ? prev - 5 : 1))}
                      className="p-2.5 bg-neutral-800 rounded-l-xl text-neutral-300 hover:bg-neutral-700 transition-colors border border-neutral-700"
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
                      className="flex-1 bg-neutral-900 border-y border-neutral-700 p-2.5 text-center text-white"
                      min="1"
                    />
                    <button
                      onClick={() => setMinutes(prev => prev + 5)}
                      className="p-2.5 bg-neutral-800 rounded-r-xl text-neutral-300 hover:bg-neutral-700 transition-colors border border-neutral-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {maxDiscountValue > 0 && (
                  <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-green-400">
                        Sconto NFT applicato: {maxDiscountValue}%
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto">
                  <div className="bg-neutral-900/50 rounded-xl p-4 mb-4 border border-neutral-800/50">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-neutral-500">Prezzo base:</p>
                      <p className="text-sm font-medium text-neutral-300">{formatEther(finalPrice)} ETH</p>
                    </div>
                    
                    {maxDiscountValue > 0 && (
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-neutral-500">Sconto ({maxDiscountValue}%):</p>
                        <p className="text-sm font-medium text-green-400">
                          -{formatEther(finalPrice - discountedPrice)} ETH
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold pt-2 border-t border-neutral-800">
                      <p className="text-white">Totale:</p>
                      <p className="text-gradient">
                        {formatEther(discountedPrice)} ETH
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleStartRide} 
                    disabled={isLoading}
                    className="w-full py-3 bg-accent-500 text-white font-medium rounded-xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20 flex items-center justify-center"
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
              
              <div className="bg-neutral-900/50 p-6 flex items-center justify-center border-l border-neutral-800/50">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-neutral-800 rounded-2xl border border-neutral-700 flex items-center justify-center">
                    <span className="text-8xl">{selectedVehicle.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{selectedVehicle.name}</h3>
                  <p className="text-neutral-400 mb-4">
                    Velocità massima: {rideType === 'Auto Green' ? '80 km/h' : rideType === 'Monopattino' ? '25 km/h' : '35 km/h'}
                  </p>
                  <div className="flex justify-center gap-2">
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/30">Eco-Friendly</span>
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/30">Elettrico</span>
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium border border-purple-500/30">Smart</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {nfts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">I tuoi NFT con sconti mobilità</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.filter(nft => nft.discountOn.includes("Viaggi")).map(nft => (
                <div key={nft.tokenId} className="glass-card rounded-xl p-4 flex items-center">
                  <div className="bg-accent-500/20 rounded-xl w-12 h-12 flex items-center justify-center mr-4 border border-accent-500/30">
                    <span className="text-xl font-mono text-accent-400">#{nft.tokenId}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{nft.rarity} NFT</p>
                    <p className="text-sm text-accent-400">{nft.discount} su {nft.discountOn}</p>
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
          <div className="w-16 h-16 mx-auto mb-4 bg-accent-500/20 rounded-2xl flex items-center justify-center border border-accent-500/30">
            <span className="text-3xl">{selectedVehicle.icon}</span>
          </div>
          
          <h3 className="text-xl font-medium text-white mb-2">{selectedVehicle.name}</h3>
          <p className={`text-lg ${locationStatus.includes('zona di Milano') ? 'text-green-400' : 'text-red-400'} mb-4`}>
            {locationStatus}
          </p>
          
          {userLatitude && userLongitude && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-700 h-64">
              <iframe 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLongitude - 0.01},${userLatitude - 0.01},${userLongitude + 0.01},${userLatitude + 0.01}&layer=mapnik&marker=${userLatitude},${userLongitude}`}
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                title="Mappa della posizione"
              ></iframe>
            </div>
          )}
          
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => setIsPopupVisible(false)} 
              className="px-5 py-2.5 bg-neutral-800 text-neutral-200 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors"
            >
              Annulla
            </button>
            
            {locationStatus.includes('zona di Milano') && (
              <button 
                onClick={startRideHandler} 
                className="px-5 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20"
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

