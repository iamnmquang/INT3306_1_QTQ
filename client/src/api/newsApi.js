import axiosInstance from './axios';

export const newsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/news');
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/news/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post('/news', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/news/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/news/${id}`);
    return res.data;
  }
};