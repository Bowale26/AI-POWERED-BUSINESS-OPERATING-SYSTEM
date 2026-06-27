import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Terminal, 
  X 
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'system';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface NotificationContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      <div 
        id="toast-container" 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface ToastItemProps {
  key?: string;
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type, message } = toast;

  // Visual configurations
  let bgClass = 'bg-dark-panel border border-white/10';
  let accentBorder = 'border-l-4 border-l-blue-400';
  let icon = <Info className="w-4 h-4 text-blue-400" />;
  let title = 'Notification';

  switch (type) {
    case 'success':
      accentBorder = 'border-l-4 border-l-emerald-500';
      icon = <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />;
      title = 'Automation Complete';
      break;
    case 'warning':
      accentBorder = 'border-l-4 border-l-amber-500';
      icon = <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />;
      title = 'System Warning';
      break;
    case 'error':
      accentBorder = 'border-l-4 border-l-rose-500';
      icon = <XCircle className="w-4 h-4 text-rose-400 animate-shake" />;
      title = 'System Error';
      break;
    case 'system':
      accentBorder = 'border-l-4 border-l-purple-500';
      icon = <Terminal className="w-4 h-4 text-purple-400" />;
      title = 'System Alert';
      break;
    default:
      accentBorder = 'border-l-4 border-l-blue-400';
      icon = <Info className="w-4 h-4 text-blue-400" />;
      title = 'Information';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-2xl ${bgClass} ${accentBorder} backdrop-blur-md relative overflow-hidden`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-grow min-w-0 pr-4">
        <h4 className="text-[11px] uppercase font-bold text-white tracking-widest font-mono">
          {title}
        </h4>
        <p className="text-[11px] text-gray-300 font-sans mt-1 leading-relaxed break-words">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 text-gray-500 hover:text-white transition-all cursor-pointer p-0.5"
        id={`close-toast-${toast.id}`}
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
