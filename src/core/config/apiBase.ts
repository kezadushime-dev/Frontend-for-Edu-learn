import { getToken } from '../../features/auth/utils/auth.storage';

const baseUrl =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  'https://backend-for-edulearn.onrender.com/api/v1';

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

export { request, ApiError };

