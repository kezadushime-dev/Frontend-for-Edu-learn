import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api } from '../shared/utils/api';
import { useLucide } from '../shared/hooks/useLucide';
import { appRoutes } from './routes';
import { clearAuth, getToken } from '../features/auth/utils/auth.storage';

const ROUTE_TRANSITION_MS = 450;

function App() {
  useLucide();
  const location = useLocation();
  const [showRouteLoader, setShowRouteLoader] = useState(true);

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
    setShowRouteLoader(true);
    const timer = window.setTimeout(() => setShowRouteLoader(false), ROUTE_TRANSITION_MS);
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

      {showRouteLoader ? (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-gradient-to-b from-slate-50 via-[#eef4ff] to-[#f8fbff] text-slate-800">
          <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">EDU LEARN</p>
            <h2 className="mt-2 text-2xl font-black text-slate-800">Loading Page</h2>
            <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-3 text-sm text-slate-500">Preparing your next screen...</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;
