import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};

export type ToastInput = {
  message: string;
  type?: ToastType;
  duration?: number;
};

export type ToastContextValue = {
  show: (input: ToastInput) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);