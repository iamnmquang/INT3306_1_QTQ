import axios from 'axios';

// Đặt địa chỉ server backend (chỉnh port theo backend bạn đang chạy)
const API_URL = 'http://localhost:4000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ===========================================
    AUTH API
=========================================== */

// [1] Đăng ký User
export const registerUser = (userData) => {
    // userData = { name, email, password }
    return api.post('/auth/register', userData);
};

// [2] Xác thực OTP đăng ký
export const verifyOtp = (otpData) => {
    // otpData = { email, otp }
    return api.post('/auth/verify-register-email', otpData);
};

// [3] Đăng nhập
export const loginUser = (credentials) => {
    // credentials = { email, password }
    return api.post('/auth/login', credentials);
};

// [4] Làm mới Token
export const refreshToken = (token) => {
    // Gửi refreshToken lên để lấy accessToken mới
    return api.post('/auth/refreshToken', { refreshToken: token });
};

// [5] Đăng xuất
export const logoutUser = (token) => {
    // Gửi refreshToken lên để xóa khỏi database/blacklist (tùy backend xử lý)
    return api.post('/auth/logout', { refreshToken: token });
};

// Cấu hình Interceptor (Tùy chọn nâng cao)
// Bạn có thể mở comment phần dưới nếu muốn tự động đính kèm Token vào mỗi request
/*
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); // Lấy token từ LocalStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
*/

export default api;