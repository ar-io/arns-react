import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@src/utils/cn';
import { X } from 'lucide-react';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { CircleCheckFilled, CircleXIcon } from '../icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }].slice(-3)); // Max 3 toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={30000}>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <CircleCheckFilled
            className="mt-[2px] shrink-0"
            width="20px"
            height="20px"
            fill="rgb(var(--color-success))"
          />
        );
      case 'error':
        return (
          <CircleXIcon
            className="shrink-0"
            width="25px"
            height="25px"
            fill="rgb(var(--color-error))"
          />
        );
      default:
        return null;
    }
  };

  return (
    <ToastPrimitive.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded border border-border bg-surface p-4 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0',
        'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=move]:transition-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-80',
        'data-[state=closed]:slide-out-to-right-full',
        'data-[state=open]:slide-in-from-bottom-full',
      )}
      duration={toast.duration ?? 30000}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="text-sm font-medium text-foreground">
          {toast.title}
        </ToastPrimitive.Title>
        {toast.description && (
          <ToastPrimitive.Description className="mt-1 text-sm text-muted">
            {toast.description}
          </ToastPrimitive.Description>
        )}
        {toast.action && (
          <ToastPrimitive.Action
            className="mt-3 inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            altText={toast.action.label}
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </ToastPrimitive.Action>
        )}
      </div>
      <ToastPrimitive.Close
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
        onClick={onClose}
      >
        <X className="size-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

function ToastViewport() {
  return (
    <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
  );
}

export { Toast, ToastViewport };
export default ToastProvider;
