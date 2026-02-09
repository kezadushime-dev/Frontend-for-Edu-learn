import { readJson, writeJson } from './storage';

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

export const getToken = () => readJson<string | null>(tokenKey, null);

export const setToken = (token: string | null) => {
  if (token) {
    writeJson(tokenKey, token);
  } else if (typeof window !== 'undefined') {
    window.localStorage.removeItem(tokenKey);
  }
};

export const getUser = () => readJson<AuthUser | null>(userKey, null);

export const setUser = (user: AuthUser | null) => {
  if (user) {
    writeJson(userKey, user);
  } else if (typeof window !== 'undefined') {
    window.localStorage.removeItem(userKey);
  }
};

export const clearAuth = () => {
  setToken(null);
  setUser(null);
};
