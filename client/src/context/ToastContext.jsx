import React, { createContext, useContext, useState } from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const show = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const api = {
        success: (msg) => show('success', msg),
        error: (msg) => show('error', msg),
        warning: (msg) => show('warning', msg),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}

            {/* ===== TOAST UI ===== */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-slide-in">
                    <div
                        className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white
              ${toast.type === 'success' && 'bg-emerald-500'}
              ${toast.type === 'error' && 'bg-red-500'}
              ${toast.type === 'warning' && 'bg-amber-500'}
            `}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <XCircle size={20} />}
                        {toast.type === 'warning' && <AlertTriangle size={20} />}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
