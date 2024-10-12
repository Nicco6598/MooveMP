import React from 'react';

interface ModalProps {
    isOpen: boolean; // Proprietà obbligatoria per gestire l'apertura del Modal
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null; // Se isOpen è false, non mostrare nulla

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
                    X
                </button>
                {children}
            </div>
        </div>
    );
};
