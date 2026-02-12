import { request } from '../../config/apiBase';
import { setToken, setUser } from '../utils/auth.storage';

export const authService = {
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; data: { user: any } }>('/auth/login', {
      method: 'POST',
      json: { email, password }
    });
    setToken(data.token);
    setUser(data.data.user);
    return data.data.user;
  },

  register: async (name: string, email: string, password: string) => {
    const data = await request<{ token: string; data: { user: any } }>('/auth/register', {
      method: 'POST',
      json: { name, email, password }
    });
    setToken(data.token);
    setUser(data.data.user);
    return data.data.user;
  },

  me: async () => {
    const data = await request<{ data: { user: any } }>('/auth/me');
    setUser(data.data.user);
    return data.data.user;
  },

  logout: async () => {
    await request('/auth/logout', { method: 'POST' });
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


