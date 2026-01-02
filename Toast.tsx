import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 right-8 z-50 animate-slide-in">
            <div className={`glass-panel border-l-4 ${type === 'success' ? 'border-l-green-500' : 'border-l-red-500'} p-4 rounded-xl shadow-2xl flex items-center gap-3 pr-10 min-w-[300px]`}>
                {type === 'success' ? (
                    <CheckCircle className="text-green-500" size={20} />
                ) : (
                    <AlertCircle className="text-red-500" size={20} />
                )}
                <p className="text-sm font-medium text-white">{message}</p>
                <button
                    onClick={onClose}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
