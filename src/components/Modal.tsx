import React, { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md' 
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Calcola la classe di larghezza in base alla proprietà size
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm transition-opacity duration-300">
            <div 
                ref={modalRef}
                className={`glass-card relative rounded-2xl shadow-2xl ${sizeClasses[size]} w-full animate-fadeIn`}
            >
                {title && (
                    <div className="border-b border-neutral-800/50 px-6 py-4">
                        <h3 className="text-lg font-medium text-white">{title}</h3>
                    </div>
                )}
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Chiudi"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className={`p-6 ${title ? 'pt-4' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Aggiungi questa animazione nel file CSS globale o in una keyframes declaration nel tailwind.config.js
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(-20px); }
//   to { opacity: 1; transform: translateY(0); }
// }

