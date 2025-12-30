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

}
