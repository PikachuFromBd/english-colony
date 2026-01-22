'use client'

import { useState, createContext, useContext } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = (message, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container - Fixed position at bottom */}
            <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto w-full max-w-sm rounded-xl p-4 shadow-lg
              flex items-center gap-3 animate-slide-up
              ${toast.type === 'success' ? 'bg-green-600/90 border border-green-400/30' : ''}
              ${toast.type === 'error' ? 'bg-red-600/90 border border-red-400/30' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-600/90 border border-yellow-400/30' : ''}
            `}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-200 flex-shrink-0" />}
                        {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-200 flex-shrink-0" />}
                        {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0" />}

                        <span className="flex-1 text-sm font-medium text-white">
                            {toast.message}
                        </span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
