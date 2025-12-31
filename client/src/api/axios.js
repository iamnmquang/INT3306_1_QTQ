import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // để gửi refresh_token cookie
});

// Lưu access token trong memory
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
  try {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
  } catch (err) {
    // ignore
  }
};

// Tự động thêm header Bearer
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ===== AUTO REFRESH TOKEN (chỉ 1 lần duy nhất) =====
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If the failing request was the refresh endpoint itself, don't attempt to refresh again.
    // Mark the error so AuthProvider can detect and force logout.
    if (originalRequest?.url && originalRequest.url.includes('/auth/refreshToken')) {
      error.isRefreshFailed = true;
      setAccessToken(null);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refreshToken');
        setAccessToken(data.accessToken);   // ← lưu token mới
        processQueue(null);
        return api(originalRequest);        // ← retry request gốc
      } catch (refreshError) {
        processQueue(refreshError);
        setAccessToken(null);
        refreshError.isRefreshFailed = true; // đánh dấu để AuthProvider logout
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;