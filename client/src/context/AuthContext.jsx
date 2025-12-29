import { createContext, useContext, useEffect, useState } from "react";
import axios from "../services/axios"; // axios của bạn

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Lấy thông tin user hiện tại
     */
    const fetchMe = async () => {
        try {
            const res = await axios.get("/auth/me");
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Chạy khi F5 / reload
     */
    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * LOGIN
     */
    const login = async (email, password) => {
        const res = await axios.post("/auth/login", { email, password });

        // Backend trả token
        const { accessToken, refreshToken } = res.data;

        // Lưu accessToken (axios interceptor sẽ dùng)
        localStorage.setItem("accessToken", accessToken);

        // (optional) nếu bạn muốn lưu refreshToken
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        await fetchMe();
        return res.data;
    };

    /**
     * LOGOUT
     */
    const logout = async () => {
        try {
            await axios.post("/auth/logout");
        } catch (err) {
            // ignore
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
