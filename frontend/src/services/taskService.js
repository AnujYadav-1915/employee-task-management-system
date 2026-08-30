import api from './api';

export const taskService = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getComments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }
};
