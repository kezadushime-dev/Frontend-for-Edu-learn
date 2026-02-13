import { useEffect, useMemo, useState } from 'react';
import { api } from '../shared/utils/api';
import { getToken, getUser, type AuthUser } from '../features/auth/utils/auth.storage';


export default function ProfileHeader() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.auth
      .me()
      .then((freshUser) => {
        if (active) setUser(freshUser);
      })
      .catch(() => {
        // Keep cached profile if refresh fails.
      });

    return () => {
      active = false;
    };
  }, [token]);

  const initials = useMemo(() => {
    const name = user?.name?.trim();
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      const first = parts[0]?.[0] || '';
      const second = parts[1]?.[0] || '';
      return (first + second).toUpperCase() || 'U';
    }
    const emailInitial = user?.email?.trim()?.[0];
    return emailInitial ? emailInitial.toUpperCase() : 'U';
  }, [user?.name, user?.email]);

  if (!token) return null;

  return (
    <div className="flex items-center gap-3 bg-white/90 px-3 py-1.5">
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name || 'Profile'}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
      )}
      <div className="text-sm leading-tight">
        <p className="font-semibold text-gray-900">{user?.name || 'Signed In'}</p>
        <p className="text-gray-500">{user?.email || 'Loading profile...'}</p>
      </div>
    </div>
  );
}
