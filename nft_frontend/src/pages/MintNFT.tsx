import React, { useState } from 'react';
import { ethers } from 'ethers';
import getContract from '../utils/getContract';
import { Modal } from '../components/Modal';

const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const discountTypes = ['5%', '10%', '15%', '20%', '25%', '30%'];
const discountCategories = ['Viaggi in monopattino', 'Viaggi in auto', 'Tutti i viaggi', 'Abbonamenti'];

const MintNFT: React.FC = () => {
    const [price, setPrice] = useState('');
    const [rarity, setRarity] = useState('');
    const [discount, setDiscount] = useState('');
    const [discountOn, setDiscountOn] = useState('');
    const [customRarity, setCustomRarity] = useState('');
    const [customDiscount, setCustomDiscount] = useState('');
    const [customDiscountOn, setCustomDiscountOn] = useState('');
    const [useCustomRarity, setUseCustomRarity] = useState(false);
    const [useCustomDiscount, setUseCustomDiscount] = useState(false);
    const [useCustomDiscountOn, setUseCustomDiscountOn] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();

    const validateForm = () => {
        const errors = [];
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            errors.push('Il prezzo deve essere un numero valido maggiore di 0');
        }
        
        if (useCustomRarity && !customRarity.trim()) {
            errors.push('Inserisci un valore per la rarità personalizzata');
        } else if (!useCustomRarity && !rarity) {
            errors.push('Seleziona una rarità');
        }
        
        if (useCustomDiscount && !customDiscount.trim()) {
            errors.push('Inserisci un valore per lo sconto personalizzato');
        } else if (!useCustomDiscount && !discount) {
            errors.push('Seleziona uno sconto');
        }
        
        if (useCustomDiscountOn && !customDiscountOn.trim()) {
            errors.push('Inserisci un valore per la categoria di sconto personalizzata');
        } else if (!useCustomDiscountOn && !discountOn) {
            errors.push('Seleziona una categoria di sconto');
        }
        
        setErrors(errors);
        return errors.length === 0;
    };

    const getRarityValue = () => useCustomRarity ? customRarity : rarity;
    const getDiscountValue = () => useCustomDiscount ? customDiscount : discount;
    const getDiscountOnValue = () => useCustomDiscountOn ? customDiscountOn : discountOn;

    const handleMint = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const contract = getContract(signer);
        try {
            const tx = await contract.createNFT(
                ethers.utils.parseEther(price),
                getRarityValue(),
                getDiscountValue(),
                getDiscountOnValue()
            );
            
            await tx.wait();
            setLoading(false);
            setSuccess(true);
            
            // Reset form
            setPrice('');
            setRarity('');
            setDiscount('');
            setDiscountOn('');
            setCustomRarity('');
            setCustomDiscount('');
            setCustomDiscountOn('');
            setUseCustomRarity(false);
            setUseCustomDiscount(false);
            setUseCustomDiscountOn(false);
        } catch (error) {
            setLoading(false);
            console.error("Errore durante il minting:", error);
            setErrors(['Errore nel minting dell\'NFT. Controlla la console per i dettagli.']);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {loading && (
                <Modal isOpen={true} onClose={() => {}} title="Minting in corso...">
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                        <p className="text-neutral-700 text-center">
                            Il tuo NFT è in fase di creazione sulla blockchain.<br />
                            Questo processo potrebbe richiedere alcuni istanti.
                        </p>
                    </div>
                </Modal>
            )}
            
            {success && (
                <Modal isOpen={true} onClose={() => setSuccess(false)} title="Minting completato!">
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-green-700 mb-2">NFT creato con successo!</h3>
                        <p className="text-neutral-600 text-center mb-4">
                            Il tuo NFT è stato creato e aggiunto alla blockchain con successo.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setSuccess(false)}
                                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                            >
                                Chiudi
                            </button>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    window.location.href = '/owned';
                                }}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Visualizza i miei NFT
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                        Crea un nuovo NFT
                    </h1>
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                    >
                        {previewMode ? 'Torna al form' : 'Anteprima'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className={`md:col-span-3 ${previewMode ? 'hidden md:block' : ''}`}>
                        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-neutral-200">
                            {errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <h3 className="text-sm font-medium text-red-800 mb-2">Correggi i seguenti errori:</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {errors.map((error, index) => (
                                            <li key={index} className="text-sm text-red-700">{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Prezzo (ETH)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    placeholder="es. 0.05"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    Questo è il prezzo a cui l'NFT verrà venduto sul marketplace.
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Rarità
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={useCustomRarity}
                                            onChange={() => setUseCustomRarity(!useCustomRarity)}
                                            className="rounded text-primary-500 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-xs text-neutral-600">Personalizzata</span>
                                    </label>
                                </div>
                                
                                {useCustomRarity ? (
                                    <input
                                        type="text"
                                        placeholder="Inserisci una rarità personalizzata"
                                        value={customRarity}
                                        onChange={e => setCustomRarity(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    />
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {rarityOptions.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setRarity(option)}
                                                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                                    rarity === option
                                                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-2 border-transparent'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Sconto
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={useCustomDiscount}
                                            onChange={() => setUseCustomDiscount(!useCustomDiscount)}
                                            className="rounded text-primary-500 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-xs text-neutral-600">Personalizzato</span>
                                    </label>
                                </div>
                                
                                {useCustomDiscount ? (
                                    <input
                                        type="text"
                                        placeholder="es. 15%"
                                        value={customDiscount}
                                        onChange={e => setCustomDiscount(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    />
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {discountTypes.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setDiscount(option)}
                                                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                                    discount === option
                                                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-2 border-transparent'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Applica sconto su
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={useCustomDiscountOn}
                                            onChange={() => setUseCustomDiscountOn(!useCustomDiscountOn)}
                                            className="rounded text-primary-500 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-xs text-neutral-600">Personalizzato</span>
                                    </label>
                                </div>
                                
                                {useCustomDiscountOn ? (
                                    <input
                                        type="text"
                                        placeholder="es. Abbonamento annuale"
                                        value={customDiscountOn}
                                        onChange={e => setCustomDiscountOn(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    />
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {discountCategories.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setDiscountOn(option)}
                                                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                                    discountOn === option
                                                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-2 border-transparent'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleMint}
                                className="w-full py-3 bg-primary-500 text-white text-lg font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
                                disabled={loading}
                            >
                                {loading ? 'In elaborazione...' : 'Crea NFT'}
                            </button>
                        </div>
                    </div>

                    <div className={`md:col-span-2 ${previewMode ? '' : 'hidden md:block'}`}>
                        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-neutral-200 sticky top-24">
                            <div className="relative">
                                <img
                                    src={`https://picsum.photos/seed/${Math.random()}/800/600`}
                                    alt="Preview NFT"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-3 right-3 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium">
                                    #Preview
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-col space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                                            {getRarityValue() || 'Rarità'} NFT
                                        </h3>
                                        <p className="text-neutral-600 text-sm">
                                            {getRarityValue() ? `Questo NFT ha una rarità di tipo ${getRarityValue()}` : 'Seleziona una rarità per il tuo NFT'}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-neutral-50 p-4 rounded-xl">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-1">Valore sconto</h4>
                                        <p className="text-lg font-bold text-secondary-700">
                                            {getDiscountValue() || 'Seleziona uno sconto'}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-neutral-50 p-4 rounded-xl">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-1">Applicato su</h4>
                                        <p className="text-lg font-bold text-secondary-700">
                                            {getDiscountOnValue() || 'Seleziona dove applicare lo sconto'}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-neutral-50 p-4 rounded-xl">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-1">Prezzo</h4>
                                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                                            {price ? `${price} ETH` : 'Imposta un prezzo'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MintNFT;