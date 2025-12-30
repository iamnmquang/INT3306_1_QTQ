import axiosInstance from './axios';

export const flightSeatApi = {
  getAvailableSeats: async (flightSeatId) => {
    const response = await axiosInstance.get(`/flightSeat/get-available-seats/${flightSeatId}`);
    return response.data;
  },

  lockSeats: async (seatDetailIds) => {
    const response = await axiosInstance.post('/flightSeat/lock-seats', { seatDetailIds });
    return response.data;
  },

  unlockSeats: async (seatDetailIds) => {
    const response = await axiosInstance.post('/flightSeat/unlock-seats', { seatDetailIds });
    return response.data;
  }
};