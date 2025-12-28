import axios from "axios";

const instance = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL || "http://localhost:4000",
    timeout: 20000
});

/* ================= REQUEST ================= */
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Không override khi upload file
        if (!config.headers["Content-Type"]) {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⚠️ Unauthorized – token expired");

            // 👉 Sau này bạn có thể cắm refresh token ở đây
            // refreshToken().then(...)
        }

        return Promise.reject(error);
    }
);

export default instance;
