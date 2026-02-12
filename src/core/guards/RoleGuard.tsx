import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getUser } from '../auth/utils/auth.storage';

type RoleGuardProps = {
  allowedRoles: Array<'learner' | 'instructor' | 'admin'>;
  children: ReactElement;
  redirectTo?: string;
};

export function RoleGuard({ allowedRoles, children, redirectTo = '/login' }: RoleGuardProps) {
  const user = getUser();
  const role = user?.role;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
