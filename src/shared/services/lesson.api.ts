import { request } from './apiBase';

export const lessonService = {
  list: async () => request<{ data: { lessons: any[] } }>('/lessons'),
  get: async (id: string) => request<{ data: { lesson: any } }>(`/lessons/${id}`),
  create: async (formData: FormData) =>
    request<{ data: { lesson: any } }>('/lessons', { method: 'POST', body: formData }),
  update: async (id: string, formData: FormData) =>
    request<{ data: { lesson: any } }>(`/lessons/${id}`, { method: 'PATCH', body: formData }),
  delete: async (id: string) => request(`/lessons/${id}`, { method: 'DELETE' })
};

