import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from '../shared/utils/api';
import { useLucide } from '../shared/hooks/useLucide';
import { appRoutes } from './routes';
import { clearAuth, getToken } from '../features/auth/utils/auth.storage';


function App() {
  useLucide();

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

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      {appRoutes.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
