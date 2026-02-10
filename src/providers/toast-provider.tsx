'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastMessage = {
  id: string;
  message: string;
  type: 'success' | 'error';
};

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = React.useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - Fixed to TOP RIGHT globally with maximum priority */}
      <div className="fixed top-20 right-4 z-[99999] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none md:top-24 md:right-8">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-2xl border p-4 shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-right-8",
              toast.type === 'success' 
                ? "bg-neutral-900 text-white border-neutral-800" 
                : "bg-red-600 text-white border-red-500"
            )}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-white shrink-0" />
            )}
            <p className="flex-1 text-sm font-semibold leading-tight">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}