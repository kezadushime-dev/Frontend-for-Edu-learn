import { request } from './apiBase';

export const quizService = {
  list: async () => request<{ data: { quizzes: any[] } }>('/quizzes'),
  get: async (id: string) => request<{ data: { quiz: any } }>(`/quizzes/${id}`),
  byLesson: async (lessonId: string) => request<{ data: { quiz: any } }>(`/quizzes/lesson/${lessonId}`),
  create: async (payload: any) => request<{ data: { quiz: any } }>('/quizzes', { method: 'POST', json: payload }),
  submit: async (id: string, answers: Array<{ selectedOptionIndex: number }>) => request<{ data: { result: any } }>(`/quizzes/${id}/submit`, { method: 'POST', json: { answers } }),
  analytics: async () => request<{ data: { analytics: any[] } }>('/quizzes/analytics'),
  delete: async (id: string) => request(`/quizzes/${id}`, { method: 'DELETE' })
};
