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
};