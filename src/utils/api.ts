import { getToken, setToken, setUser } from './auth';

const baseUrl =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  'http://localhost:8008/api/v1';

type ApiOptions = RequestInit & { json?: unknown };

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (options.json) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body
  });

  if (res.status === 204) return null as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new ApiError(res.status, message);
  }

  return data as T;
};

export const api = {
  auth: {
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
  },

  lessons: {
    list: async () => request<{ data: { lessons: any[] } }>('/lessons'),
    get: async (id: string) => request<{ data: { lesson: any } }>(`/lessons/${id}`),
    create: async (formData: FormData) =>
      request<{ data: { lesson: any } }>('/lessons', { method: 'POST', body: formData })
  },

  quizzes: {
    list: async () => request<{ data: { quizzes: any[] } }>('/quizzes'),
    get: async (id: string) => request<{ data: { quiz: any } }>(`/quizzes/${id}`),
    byLesson: async (lessonId: string) => request<{ data: { quiz: any } }>(`/quizzes/lesson/${lessonId}`),
    create: async (payload: any) => request<{ data: { quiz: any } }>('/quizzes', { method: 'POST', json: payload }),
    submit: async (id: string, answers: Array<{ selectedOptionIndex: number }>) =>
      request<{ data: { result: any } }>(`/quizzes/${id}/submit`, { method: 'POST', json: { answers } }),
    analytics: async () => request<{ data: { analytics: any[] } }>('/quizzes/analytics')
  },

  admin: {
    users: async () => request<{ data: { users: any[] } }>('/admin/users'),
    deleteUser: async (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    statistics: async () => request<{ data: { statistics: any } }>('/admin/statistics')
  }
};

export { ApiError };
