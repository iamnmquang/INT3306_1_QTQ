import axiosInstance from './axios';

export const ticketApi = {
  confirmBookings: async (bookingData) => {
    const response = await axiosInstance.post('/ticket/confirm-bookings', { bookingData });
    return response.data;
  },

  sendETicket: async (bookingRef) => {
    const response = await axiosInstance.post('/ticket/send-eticket', { bookingRef });
    return response.data;
  },

  getUserTickets: async () => {
    const response = await axiosInstance.get('/ticket/user/my-tickets');
    return response.data;
  },

  sendCancelCode: async (ticketNumber) => {
    const response = await axiosInstance.post('/ticket/cancel/send-code', { ticketNumber });
    return response.data;
  },

  verifyCancelCode: async (ticketNumber, cancelCode) => {
    const response = await axiosInstance.post('/ticket/cancel/verify-code', { ticketNumber, cancelCode });
    return response.data;
  },

  cancelTicket: async (ticketNumber, cancelCode) => {
    const response = await axiosInstance.post('/ticket/cancel', { ticketNumber, cancelCode });
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post('/ticket', payload);
    return response.data;
  }
};