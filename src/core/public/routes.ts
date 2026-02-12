import { withPaths } from '../../app/route.types';
import HomePage from './pages/HomePage';

export const publicRoutes = withPaths(HomePage, '/home');
