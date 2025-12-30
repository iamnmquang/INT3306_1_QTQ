import axiosInstance from './axios';

export const aircraftApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/aircraft');
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/aircraft/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post('/aircraft', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/aircraft/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/aircraft/${id}`);
    return res.data;
  }
};