import { withPaths, type AppRoute } from '../../app/route.types';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SignupPage from './pages/SignupPage';

export const authRoutes: AppRoute[] = [
  ...withPaths(LoginPage, '/login'),
  ...withPaths(SignupPage, '/signup'),
  ...withPaths(ForgotPasswordPage, '/forgot-password'),
  ...withPaths(ResetPasswordPage, '/reset-password/:token')
];
