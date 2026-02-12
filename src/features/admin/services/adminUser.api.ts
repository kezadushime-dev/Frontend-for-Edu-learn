import { request } from '../../../core/config/apiBase';

export const adminService = {
  users: async () => request<{ data: { users: any[] } }>('/admin/users'),
  updateRole: async (id: string, role: string) => request<{ data: { user: any } }>(`/admin/users/${id}`, { method: 'PATCH', json: { role } }),
  deleteUser: async (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  statistics: async () => request<{ data: { statistics: any } }>('/admin/statistics'),
  createUser: async (userData: any) => request<{ data: { user: any } }>('/admin/users', { method: 'POST', json: userData })
};

