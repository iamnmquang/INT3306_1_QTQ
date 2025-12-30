import axiosInstance from './axios';

export const airportApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/airport');
    return response.data;
  },
};