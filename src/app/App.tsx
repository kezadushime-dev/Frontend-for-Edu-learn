import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api } from '../shared/utils/api';
import { useLucide } from '../shared/hooks/useLucide';
import { appRoutes } from './routes';
import { clearAuth, getToken } from '../features/auth/utils/auth.storage';

const ROUTE_TRANSITION_MS = 450;

function App() {
  useLucide();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api.auth.me().catch((error: unknown) => {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: number }).status)
        : null;
      if (status === 401 || status === 403) {
        clearAuth();
      }
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => null, ROUTE_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [location.key]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {appRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

    </>
  );
}

export default App;
