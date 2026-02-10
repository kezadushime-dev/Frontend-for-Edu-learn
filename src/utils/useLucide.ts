import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

export function useLucide() {
  const location = useLocation();

  useEffect(() => {
    window.setTimeout(() => {
      window.lucide?.createIcons();
    }, 0);
  }, [location.pathname]);
}
