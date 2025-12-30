import axiosInstance from './axios';

export const userApi = {
  // Get current user's profile
  getProfile: async () => {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profile) => {
    const response = await axiosInstance.put('/user/profile', profile);
    return response.data;
  },

  // Change password
  changePassword: async ({ oldPassword, newPassword }) => {
    const response = await axiosInstance.put('/user/profile/password', {
      oldPassword,
      newPassword
    });
    return response.data;
  // Admin / Generic
  getAll: async () => {
    const res = await axiosInstance.get('/user');
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/user/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post('/user', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/user/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/user/${id}`);
    return res.data;
  }

}
