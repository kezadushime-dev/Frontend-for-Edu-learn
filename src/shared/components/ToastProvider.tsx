import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastInput = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  show: (input: ToastInput) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: 'border-emerald-500 text-emerald-700',
  error: 'border-red-500 text-red-700',
  info: 'border-blue-500 text-blue-700'
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const show = useCallback(
    ({ message, type = 'info', duration = 3200 }: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((items) => [...items, { id, message, type, duration }]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, duration) => show({ message, type: 'success', duration }),
      error: (message, duration) => show({ message, type: 'error', duration }),
      info: (message, duration) => show({ message, type: 'info', duration })
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] max-w-[360px] rounded-lg border bg-white px-4 py-3 shadow-xl ${typeStyles[toast.type]}`}
          >
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
