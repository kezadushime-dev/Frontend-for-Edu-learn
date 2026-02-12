import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getToken } from '../../features/auth/utils/auth.storage';

type PrivateRouteProps = {
  children: ReactElement;
  redirectTo?: string;
};

export function PrivateRoute({ children, redirectTo = '/login' }: PrivateRouteProps) {
  if (!getToken()) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}
