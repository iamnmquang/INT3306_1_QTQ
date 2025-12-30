import axiosInstance from './axios';

export const authApi = {
  // Login
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Register
  register: async (name, email, password) => {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Verify account with OTP
  verifyAccount: async (email, otp) => {
    const response = await axiosInstance.post('/auth/verify-register-email', {
      email,
      otp,
    });
    return response.data;
  },

  // Forgot password - Send OTP
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Verify reset otp
  verifyResetEmail: async (email, otp) => {
    const response = await axiosInstance.post('/auth/verify-reset-email', {
      email,
      otp
    });
    return response.data;
  },

  // Reset password with OTP
  changePassword: async (email,  newPassword) => {
    const response = await axiosInstance.post('/auth/change-password', {
      email,
      newPassword,
    });
    return response.data;
  },


  // Logout
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },


  // Refresh token (usually called automatically by interceptor)
  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/refreshToken');
    return response.data;
  },
  
};