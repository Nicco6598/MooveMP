import React, { useState, useEffect } from 'react';
import { BrowserProvider, parseEther } from 'ethers';
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

    const [signer, setSigner] = useState<Awaited<ReturnType<BrowserProvider['getSigner']>> | null>(null);

    useEffect(() => {
        const initSigner = async () => {
            if (window.ethereum) {
                const provider = new BrowserProvider(window.ethereum);
                const s = await provider.getSigner();
                setSigner(s);
            }
        };
        initSigner();
    }, []);

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

        if (!signer) {
            setErrors(['Wallet non connesso. Connetti il tuo wallet per creare un NFT.']);
            return;
        }

        setLoading(true);
        const contract = getContract(signer);
        try {
            const tx = await contract.createNFT(
                parseEther(price),
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
        <div className="min-h-screen">
            {loading && (
                <Modal isOpen={true} onClose={() => {}} title="Minting in corso...">
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-2 border-neutral-700 border-t-accent-500 mb-4"></div>
                        <p className="text-neutral-300 text-center">
                            Il tuo NFT è in fase di creazione sulla blockchain.<br />
                            Questo processo potrebbe richiedere alcuni istanti.
                        </p>
                    </div>
                </Modal>
            )}
            
            {success && (
                <Modal isOpen={true} onClose={() => setSuccess(false)} title="Minting completato!">
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 border border-green-500/30">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">NFT creato con successo!</h3>
                        <p className="text-neutral-400 text-center mb-6">
                            Il tuo NFT è stato creato e aggiunto alla blockchain.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSuccess(false)}
                                className="px-4 py-2.5 bg-neutral-800 text-neutral-200 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors"
                            >
                                Chiudi
                            </button>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    window.location.href = '/owned';
                                }}
                                className="px-4 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20"
                            >
                                Visualizza i miei NFT
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                        Crea un nuovo <span className="text-gradient">NFT</span>
                    </h1>
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors text-sm"
                    >
                        {previewMode ? 'Torna al form' : 'Anteprima'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className={`md:col-span-3 ${previewMode ? 'hidden md:block' : ''}`}>
                        <div className="glass-card rounded-2xl p-6">
                            {errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                    <h3 className="text-sm font-medium text-red-400 mb-2">Correggi i seguenti errori:</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {errors.map((error, index) => (
                                            <li key={index} className="text-sm text-red-300">{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Prezzo (ETH)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    placeholder="es. 0.05"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="input-dark"
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    Questo è il prezzo a cui l'NFT verrà venduto sul marketplace.
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-neutral-300">
                                        Rarità
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useCustomRarity}
                                            onChange={() => setUseCustomRarity(!useCustomRarity)}
                                            className="rounded bg-neutral-800 border-neutral-700 text-accent-500 focus:ring-accent-500"
                                        />
                                        <span className="ml-2 text-xs text-neutral-400">Personalizzata</span>
                                    </label>
                                </div>
                                
                                {useCustomRarity ? (
                                    <input
                                        type="text"
                                        placeholder="Inserisci una rarità personalizzata"
                                        value={customRarity}
                                        onChange={e => setCustomRarity(e.target.value)}
                                        className="input-dark"
                                    />
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {rarityOptions.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setRarity(option)}
                                                className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    rarity === option
                                                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50'
                                                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
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
                                    <label className="block text-sm font-medium text-neutral-300">
                                        Sconto
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useCustomDiscount}
                                            onChange={() => setUseCustomDiscount(!useCustomDiscount)}
                                            className="rounded bg-neutral-800 border-neutral-700 text-accent-500 focus:ring-accent-500"
                                        />
                                        <span className="ml-2 text-xs text-neutral-400">Personalizzato</span>
                                    </label>
                                </div>
                                
                                {useCustomDiscount ? (
                                    <input
                                        type="text"
                                        placeholder="es. 15%"
                                        value={customDiscount}
                                        onChange={e => setCustomDiscount(e.target.value)}
                                        className="input-dark"
                                    />
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {discountTypes.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setDiscount(option)}
                                                className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    discount === option
                                                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50'
                                                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
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
                                    <label className="block text-sm font-medium text-neutral-300">
                                        Applica sconto su
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useCustomDiscountOn}
                                            onChange={() => setUseCustomDiscountOn(!useCustomDiscountOn)}
                                            className="rounded bg-neutral-800 border-neutral-700 text-accent-500 focus:ring-accent-500"
                                        />
                                        <span className="ml-2 text-xs text-neutral-400">Personalizzato</span>
                                    </label>
                                </div>
                                
                                {useCustomDiscountOn ? (
                                    <input
                                        type="text"
                                        placeholder="es. Abbonamento annuale"
                                        value={customDiscountOn}
                                        onChange={e => setCustomDiscountOn(e.target.value)}
                                        className="input-dark"
                                    />
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {discountCategories.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setDiscountOn(option)}
                                                className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    discountOn === option
                                                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50'
                                                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
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
                                className="w-full py-3 bg-accent-500 text-white text-lg font-medium rounded-xl hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/20"
                                disabled={loading}
                            >
                                {loading ? 'In elaborazione...' : 'Crea NFT'}
                            </button>
                        </div>
                    </div>

                    <div className={`md:col-span-2 ${previewMode ? '' : 'hidden md:block'}`}>
                        <div className="glass-card rounded-2xl overflow-hidden sticky top-24">
                            <div className="relative">
                                <img
                                    src={`https://picsum.photos/seed/${Math.random()}/800/600`}
                                    alt="Preview NFT"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                                <div className="absolute top-3 right-3 px-3 py-1 bg-neutral-900/80 backdrop-blur-sm rounded-lg text-sm font-mono text-neutral-300 border border-neutral-700/50">
                                    #Preview
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-col space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gradient">
                                            {getRarityValue() || 'Rarità'}
                                        </h3>
                                        <p className="text-neutral-400 text-sm">
                                            {getRarityValue() ? `Questo NFT ha una rarità di tipo ${getRarityValue()}` : 'Seleziona una rarità per il tuo NFT'}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
                                        <h4 className="text-xs font-medium text-neutral-500 mb-1">Valore sconto</h4>
                                        <p className="text-lg font-bold text-accent-400">
                                            {getDiscountValue() || 'Seleziona uno sconto'}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
                                        <h4 className="text-xs font-medium text-neutral-500 mb-1">Applicato su</h4>
                                        <p className="text-lg font-bold text-white">
                                            {getDiscountOnValue() || 'Seleziona dove applicare lo sconto'}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
                                        <h4 className="text-xs font-medium text-neutral-500 mb-1">Prezzo</h4>
                                        <p className="text-lg font-bold text-gradient">
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

