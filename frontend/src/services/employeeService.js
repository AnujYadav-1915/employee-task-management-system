import api from './api';

export const employeeService = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/employees/stats');
    return response.data;
  },

  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};
