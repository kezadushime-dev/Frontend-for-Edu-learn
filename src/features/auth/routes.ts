import { withPaths, type AppRoute } from '../../app/route.types';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SignupPage from './pages/SignupPage';

export const authRoutes: AppRoute[] = [
  ...withPaths(LoginPage, '/login'),
  ...withPaths(SignupPage, '/signup'),
  ...withPaths(ForgotPasswordPage, '/forgot-password'),
  ...withPaths(ResetPasswordPage, '/reset-password/:token'),
  ...withPaths(
    ProfileSettingsPage,
    '/profile-settings',
    '/admin/profile-settings',
    '/instructor/profile-settings',
    '/learner/profile-settings'
  )
];
