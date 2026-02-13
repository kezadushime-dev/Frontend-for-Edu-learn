import { request } from '../../../core/config/apiBase';
import { clearAuth, setToken, setUser } from '../utils/auth.storage';

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {};

const extractUser = (payload: unknown): UnknownRecord | null => {
  const body = toRecord(payload);
  const data = toRecord(body.data);
  const user = data.user ?? body.user ?? null;
  return user && typeof user === 'object' ? (user as UnknownRecord) : null;
};

const extractToken = (payload: unknown): string | null => {
  const body = toRecord(payload);
  const data = toRecord(body.data);
  const token =
    body.token ??
    data.token ??
    data.accessToken ??
    body.accessToken ??
    body.jwt ??
    data.jwt;
  return typeof token === 'string' && token.length ? token : null;
};

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    const data = await request<unknown>('/auth/login', {
      method: 'POST',
      json: { email, password }
    });

    const token = extractToken(data);
    if (token) setToken(token);

    const user = extractUser(data);
    if (user) setUser(user);
    return user as any;
  },

  register: async (name: string, email: string, password: string): Promise<any> => {
    const data = await request<unknown>('/auth/register', {
      method: 'POST',
      json: { name, email, password }
    });

    const token = extractToken(data);
    if (token) setToken(token);

    const user = extractUser(data);
    if (user) setUser(user);
    return user as any;
  },

  me: async (): Promise<any> => {
    const data = await request<unknown>('/auth/me');
    const user = extractUser(data);
    if (user) setUser(user);
    return user as any;
  },

  updateMe: async (payload: { name?: string; email?: string; image?: string }): Promise<any> => {
    const data = await request<unknown>('/auth/me', {
      method: 'PATCH',
      json: payload
    });
    const user = extractUser(data);
    if (user) setUser(user);
    return user as any;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuth();
    }
  },

  deleteAccount: async () => {
    await request('/auth/delete-account', { method: 'DELETE' });
    clearAuth();
  },

  forgotPassword: async (email: string) => {
    return request<{ message?: string }>('/auth/forgot-password', {
      method: 'POST',
      json: { email }
    });
  },

  resetPassword: async (token: string, password: string) => {
    return request<{ message?: string }>(`/auth/reset-password/${token}`, {
      method: 'PATCH',
      json: { password }
    });
  }
};


