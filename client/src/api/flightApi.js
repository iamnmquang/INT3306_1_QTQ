import axiosInstance from './axios';

export const flightApi = {
  // Search flights by criteria
  search: async ({ departureCity, arrivalCity, departureTime, passengerNum }) => {
    const response = await axiosInstance.post('/flight/search', {
      departureCity,
      arrivalCity,
      departureTime,
      passengerNum,
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/flight/${id}`);
    return response.data;
  },

  // Admin / CRUD
  getAll: async () => {
    const response = await axiosInstance.get('/flight');
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post('/flight', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.put(`/flight/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/flight/${id}`);
    return response.data;
  },
};
