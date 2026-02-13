export type AuthUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: 'learner' | 'instructor' | 'admin';
  image?: string;
};

const tokenKey = 'edulearn_token';
const userKey = 'edulearn_user';

const parseStored = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as T;
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const raw =
    window.localStorage.getItem(tokenKey) ||
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('accessToken');

  const parsed = parseStored<string | null>(raw);
  if (typeof parsed !== 'string') return null;

  const clean = parsed.trim().replace(/^"|"$/g, '');
  return clean.length ? clean : null;
};

export const setToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(tokenKey, token);
  } else {
    window.localStorage.removeItem(tokenKey);
  }
};

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(userKey);
  const parsed = parseStored<unknown>(raw);

  if (!parsed || typeof parsed !== 'object') return null;
  return parsed as AuthUser;
};

export const setUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(userKey, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(userKey);
  }
};

export const clearAuth = () => {
  setToken(null);
  setUser(null);
};

