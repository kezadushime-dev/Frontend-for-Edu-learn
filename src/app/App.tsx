import { Navigate, Route, Routes } from 'react-router-dom';
import { useLucide } from '../shared/hooks/useLucide';
import { appRoutes } from './routes';


function App() {
  useLucide();

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
